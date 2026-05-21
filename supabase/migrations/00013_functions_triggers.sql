-- Migration 00013: Functions and triggers
--   set_updated_at()           — applied to all mutable tables
--   audit_trigger()            — audit log for critical tables
--   handle_new_user()          — auto-create profile (defined in 00004, re-used here for triggers)
--   auto_cancel_overdue_processes() — pg_cron job
--   All trigger registrations

-- ─── set_updated_at ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to every table that has an updated_at column
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients',
    'client_settings',
    'profiles',
    'quarter_tariffs',
    'building_tariffs',
    'ert_tariffs',
    'engineers',
    'executors',
    'panel_makers',
    'elect_projects',
    'elect_project_processes',
    'comment_eng_forms',
    'check_list_forms',
    'check_list_edcs',
    'elect_project_ert_forms',
    'transactions',
    'invoices',
    'eng_payment_tasks',
    'eng_payment_lists',
    'eng_quota_burns',
    'supports'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ─── audit_trigger ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    client_id, user_id, action, entity, entity_id, old_values, new_values
  ) VALUES (
    COALESCE(
      (NEW.client_id)::uuid,
      (OLD.client_id)::uuid
    ),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to critical tables
CREATE TRIGGER audit_elect_projects
  AFTER INSERT OR UPDATE OR DELETE ON elect_projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ─── auto_cancel_overdue_processes ───────────────────────────────────────────
-- Marks processes as cancelled (inspection_status=99) when overdue by > 30 days
-- Scheduled via pg_cron (see cron.schedule call below)
CREATE OR REPLACE FUNCTION auto_cancel_overdue_processes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE elect_project_processes
     SET inspection_status = 99,  -- Cancelled
         updated_at        = now()
   WHERE accepted          = false
     AND is_delete         = false
     AND inspection_status NOT IN (2, 99)  -- 2=Accepted, 99=Cancelled
     AND created_at < now() - INTERVAL '30 days';
END;
$$;

-- Register the pg_cron daily job (runs at 01:00 UTC every day)
SELECT cron.schedule(
  'auto_cancel_overdue_processes',
  '0 1 * * *',
  'SELECT auto_cancel_overdue_processes()'
);
