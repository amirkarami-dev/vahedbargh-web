-- Migration 00016: /app portal supporting tables
--
-- NOTE: All core tables already exist from earlier migrations:
--   • user_roles            — 00004_auth_profiles.sql   (user_id, role, client_id PK)
--   • supports              — 00011_support.sql          (support tickets)
--   • support_messages      — 00011_support.sql
--   • support_files         — 00011_support.sql
--   • transactions          — 00010_finance.sql          (financial transactions)
--   • eng_payment_lists     — 00010_finance.sql          (engineer payments)
--   • elect_project_files   — 00009_files.sql            (project documents)
--   • user_files            — 00009_files.sql
--   • All RLS policies      — 00014_rls_policies.sql
--   • All updated_at trigs  — 00013_functions_triggers.sql
--
-- This migration ONLY adds what is genuinely missing for the /app portal:
--   1. project_notes      — free-text notes per project (logged by any user)
--   2. engineer_task_logs — time-tracking / work logs for engineers
--   3. Additional helpful indexes on existing tables

-- ════════════════════════════════════════════════════════════════════
-- 1. project_notes
--    Allows any portal user to attach notes/comments to a project.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS project_notes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid        NOT NULL REFERENCES clients(id),
  elect_project_id uuid        NOT NULL REFERENCES elect_projects(id) ON DELETE CASCADE,
  user_id          uuid        NOT NULL REFERENCES auth.users(id),
  note             text        NOT NULL,
  is_internal      boolean     NOT NULL DEFAULT false,  -- internal staff note vs client-visible
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_project_notes_project
  ON project_notes(elect_project_id);

CREATE INDEX IF NOT EXISTS idx_project_notes_client
  ON project_notes(client_id);

ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- All tenant users can read non-internal notes for their projects
CREATE POLICY "project_notes_tenant_read"
  ON project_notes FOR SELECT
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND (
      is_internal = false
      OR EXISTS (
        SELECT 1 FROM user_roles
         WHERE user_id   = auth.uid()
           AND role      IN ('Administrator', 'SuperUser', 'Employee', 'Section', 'ElectAdmin')
           AND client_id = (auth.jwt() ->> 'cid')::uuid
      )
    )
  );

-- Any tenant user can insert notes
CREATE POLICY "project_notes_tenant_insert"
  ON project_notes FOR INSERT
  WITH CHECK (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND user_id = auth.uid()
  );

-- Only the owner or admin can update/delete
CREATE POLICY "project_notes_owner_or_admin_modify"
  ON project_notes FOR UPDATE
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_roles
         WHERE user_id   = auth.uid()
           AND role      IN ('Administrator', 'SuperUser')
           AND client_id = (auth.jwt() ->> 'cid')::uuid
      )
    )
  );

CREATE POLICY "project_notes_owner_or_admin_delete"
  ON project_notes FOR DELETE
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_roles
         WHERE user_id   = auth.uid()
           AND role      IN ('Administrator', 'SuperUser')
           AND client_id = (auth.jwt() ->> 'cid')::uuid
      )
    )
  );

-- updated_at trigger
CREATE TRIGGER trg_project_notes_updated_at
  BEFORE UPDATE ON project_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- 2. engineer_task_logs
--    Work-log / time-tracking for engineers on specific projects.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS engineer_task_logs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid        NOT NULL REFERENCES clients(id),
  elect_project_id uuid        NOT NULL REFERENCES elect_projects(id) ON DELETE CASCADE,
  engineer_id      uuid        NOT NULL REFERENCES engineers(id),
  description      text        NOT NULL DEFAULT '',
  hours_worked     numeric(6,2) NOT NULL DEFAULT 0,
  solar_date       text        NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eng_task_logs_project
  ON engineer_task_logs(elect_project_id);

CREATE INDEX IF NOT EXISTS idx_eng_task_logs_engineer
  ON engineer_task_logs(engineer_id);

ALTER TABLE engineer_task_logs ENABLE ROW LEVEL SECURITY;

-- Engineer sees own logs; admin/accountant/section see all in tenant
CREATE POLICY "eng_task_logs_own_read"
  ON engineer_task_logs FOR SELECT
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND (
      EXISTS (
        SELECT 1 FROM engineers e
         WHERE e.id      = engineer_task_logs.engineer_id
           AND e.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM user_roles
         WHERE user_id   = auth.uid()
           AND role      IN ('Administrator', 'SuperUser', 'Accountant', 'Section', 'Employee')
           AND client_id = (auth.jwt() ->> 'cid')::uuid
      )
    )
  );

CREATE POLICY "eng_task_logs_engineer_insert"
  ON engineer_task_logs FOR INSERT
  WITH CHECK (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM engineers e
       WHERE e.id      = engineer_task_logs.engineer_id
         AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "eng_task_logs_admin_modify"
  ON engineer_task_logs FOR ALL
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 3. Additional indexes on existing tables for /app portal queries
-- ════════════════════════════════════════════════════════════════════

-- elect_project_files: speed up queries filtered by user (uploader)
CREATE INDEX IF NOT EXISTS idx_epf_user
  ON elect_project_files(user_id);

-- supports: speed up queries by ticket number
CREATE INDEX IF NOT EXISTS idx_supports_ticket_number
  ON supports(ticket_number);

-- transactions: speed up date-range queries
CREATE INDEX IF NOT EXISTS idx_transactions_solar_created
  ON transactions(solar_created);
