-- Migration 00015: Public-facing CMS content tables
--   announcements  — news/bulletins shown on the public site
--   meetings       — board meeting records shown on the public site
--   documents      — downloadable documents & forms
--   stats          — homepage KPI counters (editable by admin)
--   site_settings  — global key/value configuration (admin-only, no RLS)
--
-- These tables are NOT multi-tenant (no client_id) — they are shared content
-- for the organisation's public website. Read access is public; write access
-- is restricted to authenticated admin users via RLS policies.

-- ════════════════════════════════════════════════════════════════════
-- announcements
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE announcements (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         text        UNIQUE NOT NULL,
  title        text        NOT NULL,
  excerpt      text        NOT NULL DEFAULT '',
  content      text        NOT NULL DEFAULT '',
  category     text        NOT NULL DEFAULT '',
  priority     text        NOT NULL DEFAULT 'info'
                           CHECK (priority IN ('urgent','important','info','news')),
  jalali_date  text        NOT NULL DEFAULT '',
  published_at timestamptz NOT NULL DEFAULT now(),
  featured     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_priority    ON announcements (priority);
CREATE INDEX idx_announcements_featured    ON announcements (featured);
CREATE INDEX idx_announcements_published_at ON announcements (published_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read published announcements
CREATE POLICY "announcements_public_read"
  ON announcements FOR SELECT
  USING (true);

-- Only authenticated users (admin) can write
CREATE POLICY "announcements_auth_write"
  ON announcements FOR ALL
  USING (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
-- meetings
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE meetings (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_number integer     NOT NULL,
  subject        text        NOT NULL,
  jalali_date    text        NOT NULL DEFAULT '',
  status         text        NOT NULL DEFAULT 'برگزار شده'
                             CHECK (status IN ('در دستور کار','برگزار شده','لغو شده')),
  type           text        NOT NULL DEFAULT 'هیئت رئیسه'
                             CHECK (type IN ('هیئت رئیسه','کمیته فنی','کمیته آموزش','کمیته مالی')),
  pdf_url        text,
  resolutions    jsonb       NOT NULL DEFAULT '[]',
  attendees      text[],
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_meetings_session_number ON meetings (session_number DESC);
CREATE INDEX idx_meetings_status         ON meetings (status);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings_public_read"
  ON meetings FOR SELECT
  USING (true);

CREATE POLICY "meetings_auth_write"
  ON meetings FOR ALL
  USING (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
-- documents
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE documents (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          text        NOT NULL,
  category       text        NOT NULL DEFAULT 'فرم اجرایی',
  jalali_date    text        NOT NULL DEFAULT '',
  version        text        NOT NULL DEFAULT '1.0',
  description    text        NOT NULL DEFAULT '',
  file_size      text        NOT NULL DEFAULT '',
  download_count integer     NOT NULL DEFAULT 0,
  tags           text[]      NOT NULL DEFAULT '{}',
  file_url       text,
  featured       boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_category       ON documents (category);
CREATE INDEX idx_documents_featured       ON documents (featured);
CREATE INDEX idx_documents_download_count ON documents (download_count DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_public_read"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "documents_auth_write"
  ON documents FOR ALL
  USING (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
-- stats  (homepage KPI counters)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE stats (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  label      text        NOT NULL,
  value      integer     NOT NULL DEFAULT 0,
  suffix     text        NOT NULL DEFAULT '',
  icon_name  text        NOT NULL DEFAULT 'FileCheck',
  sort_order integer     NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stats_sort_order ON stats (sort_order ASC);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stats_public_read"
  ON stats FOR SELECT
  USING (true);

CREATE POLICY "stats_auth_write"
  ON stats FOR ALL
  USING (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
-- site_settings  (admin-only, no RLS — accessed via service role key)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE site_settings (
  key        text        PRIMARY KEY,
  value      text        NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- No RLS — server-side code uses SUPABASE_SERVICE_ROLE_KEY for this table
-- (see comment in migration 00014 line 477)

-- ─── updated_at triggers ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at_content()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_content();

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_content();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_content();

CREATE TRIGGER trg_stats_updated_at
  BEFORE UPDATE ON stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_content();

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_content();

-- ─── Default site settings ────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES
  ('site_name',        'دفتر اجرایی نظارت برق کردستان'),
  ('contact_email',    'info@kurdnezambargh.ir'),
  ('contact_phone',    '087-33669900'),
  ('contact_address',  'سنندج، خیابان پاسداران، سازمان نظام مهندسی ساختمان کردستان'),
  ('footer_text',      'تمامی حقوق محفوظ است © سازمان نظام مهندسی ساختمان کردستان'),
  ('hero_title',       'دفتر اجرایی نظارت برق'),
  ('hero_subtitle',    'نظارت بر تأسیسات برقی ساختمان‌های استان کردستان');
