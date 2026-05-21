-- Migration 00014: Row Level Security — enable RLS and define policies for all tables
--
-- Patterns used (from compliance/security/SECURITY.md):
--   Pattern A  — tenant-scoped: client_id = (auth.jwt() ->> 'cid')::uuid
--   Pattern B  — role-gated write: above + EXISTS(user_roles lookup)
--   Pattern C  — owner-only: personal data or assigned engineer
--
-- Roles used: 'Administrator', 'SuperUser', 'Section', 'Accountant', 'Employee', 'Engineer'
-- site_settings has no RLS (admin-only via service role key server-side)

-- ─── Helper: inline role check ───────────────────────────────────────────────
-- INLINE: EXISTS (SELECT 1 FROM user_roles WHERE user_id=auth.uid() AND role IN (...) AND client_id=(auth.jwt()->>'cid')::uuid)

-- ════════════════════════════════════════════════════════════════════
-- clients
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_tenant_read"
  ON clients FOR SELECT
  USING (id = (auth.jwt() ->> 'cid')::uuid);

CREATE POLICY "clients_superuser_write"
  ON clients FOR ALL
  USING (
    id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      = 'SuperUser'
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- client_settings
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE client_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_settings_tenant_access"
  ON client_settings FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- client_areas / client_area_points
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE client_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_areas_tenant_access"
  ON client_areas FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE client_area_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_area_points_tenant_access"
  ON client_area_points FOR ALL
  USING (
    area_id IN (
      SELECT id FROM client_areas
       WHERE client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- profiles — owner sees own row; admin sees all in tenant
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_row"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_tenant_read"
  ON profiles FOR SELECT
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ════════════════════════════════════════════════════════════════════
-- user_roles — admin only
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_admin_access"
  ON user_roles FOR ALL
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles ur
       WHERE ur.user_id   = auth.uid()
         AND ur.role      IN ('Administrator', 'SuperUser')
         AND ur.client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- engineers
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "engineers_tenant_read"
  ON engineers FOR SELECT
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

CREATE POLICY "engineers_admin_write"
  ON engineers FOR INSERT
  WITH CHECK (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'Accountant', 'Section')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

CREATE POLICY "engineers_admin_update"
  ON engineers FOR UPDATE
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'Accountant', 'Section')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

CREATE POLICY "engineers_admin_delete"
  ON engineers FOR DELETE
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
-- engineer_histories
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE engineer_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "engineer_histories_tenant_access"
  ON engineer_histories FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- executors / panel_makers
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE executors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "executors_tenant_access"
  ON executors FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE panel_makers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "panel_makers_tenant_access"
  ON panel_makers FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- quarter_tariffs / building_tariffs / ert_tariffs
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE quarter_tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quarter_tariffs_tenant_access"
  ON quarter_tariffs FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE building_tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "building_tariffs_tenant_access"
  ON building_tariffs FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE ert_tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ert_tariffs_tenant_access"
  ON ert_tariffs FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- elect_projects
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE elect_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elect_projects_tenant_read"
  ON elect_projects FOR SELECT
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

CREATE POLICY "elect_projects_tenant_insert"
  ON elect_projects FOR INSERT
  WITH CHECK (client_id = (auth.jwt() ->> 'cid')::uuid);

CREATE POLICY "elect_projects_tenant_update"
  ON elect_projects FOR UPDATE
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

CREATE POLICY "elect_projects_admin_delete"
  ON elect_projects FOR DELETE
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser', 'Section')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- elect_project_processes
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE elect_project_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "epp_tenant_read"
  ON elect_project_processes FOR SELECT
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

CREATE POLICY "epp_tenant_insert"
  ON elect_project_processes FOR INSERT
  WITH CHECK (client_id = (auth.jwt() ->> 'cid')::uuid);

-- Engineers can only update their own assigned processes
CREATE POLICY "epp_engineer_own_update"
  ON elect_project_processes FOR UPDATE
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND (
      -- Admins/Section can update any
      EXISTS (
        SELECT 1 FROM user_roles
         WHERE user_id   = auth.uid()
           AND role      IN ('Administrator', 'SuperUser', 'Section')
           AND client_id = (auth.jwt() ->> 'cid')::uuid
      )
      OR
      -- Engineer can update only their own
      EXISTS (
        SELECT 1 FROM engineers
         WHERE id      = elect_project_processes.engineer_id
           AND user_id = auth.uid()
      )
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- Forms (comment_eng_forms, check_list_forms, check_list_edcs, elect_project_ert_forms)
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE comment_eng_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_eng_forms_tenant_access"
  ON comment_eng_forms FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE check_list_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "check_list_forms_tenant_access"
  ON check_list_forms FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE check_list_edcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "check_list_edcs_tenant_access"
  ON check_list_edcs FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE elect_project_ert_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elect_project_ert_forms_tenant_access"
  ON elect_project_ert_forms FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- Files
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE elect_project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elect_project_files_tenant_access"
  ON elect_project_files FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_files_own_or_admin"
  ON user_files FOR ALL
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

-- ════════════════════════════════════════════════════════════════════
-- Finance
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_transactions_accountant_access"
  ON bank_transactions FOR ALL
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser', 'Accountant')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_tenant_read"
  ON transactions FOR SELECT
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

CREATE POLICY "transactions_accountant_write"
  ON transactions FOR INSERT
  WITH CHECK (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'Accountant')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

CREATE POLICY "transactions_accountant_update"
  ON transactions FOR UPDATE
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'Accountant')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_tenant_access"
  ON invoices FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE eng_payment_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eng_payment_tasks_tenant_access"
  ON eng_payment_tasks FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE eng_payment_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eng_payment_lists_tenant_access"
  ON eng_payment_lists FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

ALTER TABLE eng_quota_burns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eng_quota_burns_tenant_access"
  ON eng_quota_burns FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- Support
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE supports ENABLE ROW LEVEL SECURITY;

-- User sees own tickets or tickets assigned to them; admin/employee sees all in tenant
CREATE POLICY "supports_participant_read"
  ON supports FOR SELECT
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND (
      user_id    = auth.uid()
      OR to_user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_roles
         WHERE user_id   = auth.uid()
           AND role      IN ('Administrator', 'SuperUser', 'Employee')
           AND client_id = (auth.jwt() ->> 'cid')::uuid
      )
    )
  );

CREATE POLICY "supports_user_insert"
  ON supports FOR INSERT
  WITH CHECK (client_id = (auth.jwt() ->> 'cid')::uuid AND user_id = auth.uid());

CREATE POLICY "supports_admin_update"
  ON supports FOR UPDATE
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser', 'Employee')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_messages_participant_access"
  ON support_messages FOR ALL
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM supports s
         WHERE s.id         = support_messages.support_id
           AND (s.user_id = auth.uid() OR s.to_user_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM user_roles
         WHERE user_id   = auth.uid()
           AND role      IN ('Administrator', 'SuperUser', 'Employee')
           AND client_id = (auth.jwt() ->> 'cid')::uuid
      )
    )
  );

ALTER TABLE support_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_files_tenant_access"
  ON support_files FOR ALL
  USING (client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- Notifications — owner-only
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_row"
  ON notifications FOR ALL
  USING (user_id = auth.uid() AND client_id = (auth.jwt() ->> 'cid')::uuid);

-- ════════════════════════════════════════════════════════════════════
-- Audit logs — admin read-only; writes only via service role / trigger
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_admin_read"
  ON audit_logs FOR SELECT
  USING (
    client_id = (auth.jwt() ->> 'cid')::uuid
    AND EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id   = auth.uid()
         AND role      IN ('Administrator', 'SuperUser')
         AND client_id = (auth.jwt() ->> 'cid')::uuid
    )
  );

-- site_settings: no RLS — service role only
-- (intentionally left without ENABLE ROW LEVEL SECURITY)
