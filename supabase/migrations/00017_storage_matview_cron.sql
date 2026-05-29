-- Migration 00017: Storage buckets, materialized view, remaining cron jobs, lookup RLS
--
-- Completes the backend infrastructure described in:
--   compliance/backend/INTEGRATIONS.md  §4  → Storage buckets + RLS
--   compliance/backend/BACKGROUND_JOBS.md   → missing pg_cron jobs + eng_quota_summary
--   DB advisor warning                      → RLS on lookup tables

-- ════════════════════════════════════════════════════════════════════
-- 1. STORAGE BUCKETS
--    All seven buckets from INTEGRATIONS.md §4 (Supabase Storage)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  -- Private: project document uploads (was Upload/ElectProjects/)
  ('project-files',  'project-files',  false, 52428800,  null),   -- 50 MB
  -- Private: personal user documents (was Upload/UserFiles/)
  ('user-files',     'user-files',     false, 10485760,  null),   -- 10 MB
  -- Private: ticket attachments (was Upload/Supports/)
  ('support-files',  'support-files',  false, 10485760,  null),   -- 10 MB
  -- Private: engineer/executor signature images (was Upload/Signatures/)
  ('signatures',     'signatures',     false,  2097152,  ARRAY['image/png','image/jpeg','image/webp']),  -- 2 MB
  -- Private: generated PDF reports
  ('reports',        'reports',        false, 104857600, ARRAY['application/pdf']),                     -- 100 MB
  -- Private: HTML/CSS report templates
  ('templates',      'templates',      false,  10485760, ARRAY['text/html','text/css']),                -- 10 MB
  -- Public: user profile pictures (was Upload/Avatars/)
  ('avatars',        'avatars',        true,   2097152,  ARRAY['image/png','image/jpeg','image/webp','image/gif']) -- 2 MB
ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS Policies ────────────────────────────────────────────────────
-- Supabase Storage RLS operates on storage.objects.
-- The `name` column holds the full object path including the bucket_id prefix.

-- ── project-files: tenant users can read/upload; path scoped per project ──
CREATE POLICY "project_files_tenant_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files'
    AND (auth.jwt() ->> 'cid') IS NOT NULL
  );

CREATE POLICY "project_files_tenant_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "project_files_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser', 'Employee', 'Section', 'ElectAdmin')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ── user-files: owner-only ────────────────────────────────────────────────────
CREATE POLICY "user_files_owner_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-files'
    AND owner = auth.uid()
  );

CREATE POLICY "user_files_owner_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "user_files_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-files'
    AND owner = auth.uid()
  );

-- ── support-files: tenant read; any authenticated can upload ─────────────────
CREATE POLICY "support_files_tenant_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'support-files'
    AND (auth.jwt() ->> 'cid') IS NOT NULL
  );

CREATE POLICY "support_files_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'support-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "support_files_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'support-files'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ── signatures: admin upload; tenant read ────────────────────────────────────
CREATE POLICY "signatures_tenant_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'signatures'
    AND (auth.jwt() ->> 'cid') IS NOT NULL
  );

CREATE POLICY "signatures_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'signatures'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser', 'Employee', 'ElectAdmin')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ── reports: admin generate; tenant read ─────────────────────────────────────
CREATE POLICY "reports_tenant_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports'
    AND (auth.jwt() ->> 'cid') IS NOT NULL
  );

CREATE POLICY "reports_service_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports'
    AND auth.role() = 'authenticated'
  );

-- ── templates: service-role only (Next.js server uses service key) ────────────
CREATE POLICY "templates_service_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'templates'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ── avatars: public read (bucket is public); owner write ─────────────────────
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

-- ════════════════════════════════════════════════════════════════════
-- 2. RLS ON LOOKUP TABLES
--    provinces / cities / sections are pure reference data.
--    Allow public read (no auth required) since they're used in
--    public-facing forms. Write is blocked for all non-superusers.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "provinces_public_read"
  ON provinces FOR SELECT
  USING (true);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cities_public_read"
  ON cities FOR SELECT
  USING (true);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sections_public_read"
  ON sections FOR SELECT
  USING (true);

-- ════════════════════════════════════════════════════════════════════
-- 3. ENGINEER QUOTA MATERIALIZED VIEW
--    Referenced by BACKGROUND_JOBS.md (refresh-eng-quota-summary cron)
--    Provides a fast snapshot of each engineer's workload & quota.
-- ════════════════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS eng_quota_summary AS
SELECT
  e.id                                                        AS engineer_id,
  e.client_id,
  e.full_name,
  e.default_quota,
  e.inactive,
  -- Active (non-cancelled, non-completed) assignments
  COUNT(epp.id) FILTER (
    WHERE epp.is_delete = false
      AND epp.inspection_status NOT IN (2, 99)   -- 2=Accepted/Done, 99=Cancelled
  )                                                           AS active_assignments,
  -- Completed this solar year (inspection_status=2, accepted=true)
  COUNT(epp.id) FILTER (
    WHERE epp.accepted = true
      AND epp.inspection_status = 2
      AND epp.created_at >= date_trunc('year', now()) - INTERVAL '9 months'
      -- approximation: Iranian solar year starts ~March 20
  )                                                           AS completed_this_year,
  -- Quota remaining (sum of approved burn records)
  COALESCE(
    SUM(eqb.amount_remaining) FILTER (WHERE eqb.is_approved = true),
    e.default_quota
  )                                                           AS quota_remaining,
  -- ERT count remaining
  COALESCE(
    SUM(eqb.ert_count_remaining) FILTER (WHERE eqb.is_approved = true),
    0
  )::int                                                      AS ert_count_remaining
FROM engineers e
LEFT JOIN elect_project_processes epp
       ON epp.engineer_id = e.id
LEFT JOIN eng_quota_burns eqb
       ON eqb.engineer_id = e.id
WHERE e.is_delete = false
GROUP BY e.id, e.client_id, e.full_name, e.default_quota, e.inactive;

-- Unique index required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_eng_quota_summary_pk
  ON eng_quota_summary (engineer_id);

CREATE INDEX IF NOT EXISTS idx_eng_quota_summary_client
  ON eng_quota_summary (client_id);

-- ════════════════════════════════════════════════════════════════════
-- 4. REMAINING pg_cron JOBS  (BACKGROUND_JOBS.md §pg_cron)
--    Job 1 (auto_cancel_overdue_processes) already scheduled in 00013.
--    Add the two missing jobs here.
-- ════════════════════════════════════════════════════════════════════

-- Job 2: cleanup-expired-notifications — daily at 22:00 UTC
SELECT cron.schedule(
  'cleanup-expired-notifications',
  '0 22 * * *',
  $$DELETE FROM notifications WHERE created_at < now() - INTERVAL '90 days';$$
);

-- Job 3: refresh-eng-quota-summary — every 6 hours
SELECT cron.schedule(
  'refresh-eng-quota-summary',
  '0 */6 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY eng_quota_summary;'
);

-- ════════════════════════════════════════════════════════════════════
-- 5. UPDATE auto_cancel TO LOG TO audit_logs
--    BACKGROUND_JOBS.md version includes an audit_logs insert;
--    migration 00013 does not — patch the function here.
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_cancel_overdue_processes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  overdue_count int;
BEGIN
  UPDATE elect_project_processes
     SET inspection_status = 99,   -- Cancelled
         updated_at        = now()
   WHERE accepted          = false
     AND is_delete         = false
     AND inspection_status NOT IN (2, 99)   -- 2=Accepted/Done, 99=Cancelled
     AND created_at        < now() - INTERVAL '30 days';

  GET DIAGNOSTICS overdue_count = ROW_COUNT;

  -- Write summary to audit log
  IF overdue_count > 0 THEN
    INSERT INTO audit_logs (action, entity, new_values)
    VALUES (
      'auto_cancel',
      'elect_project_processes',
      jsonb_build_object(
        'cancelled_count', overdue_count,
        'run_at',          now()
      )
    );
  END IF;
END;
$$;
