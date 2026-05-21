-- Migration 00012: Notifications, audit_logs, site_settings

CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  uuid NOT NULL REFERENCES clients(id),
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  title      text NOT NULL,
  body       text,
  type       text NOT NULL DEFAULT 'info',
  is_read    boolean NOT NULL DEFAULT false,
  payload    jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE audit_logs (
  id         bigserial PRIMARY KEY,
  client_id  uuid REFERENCES clients(id),
  user_id    uuid REFERENCES auth.users(id),
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_client ON audit_logs(client_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);

-- site_settings: global key-value store (no RLS, admin-only via service role)
CREATE TABLE site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
