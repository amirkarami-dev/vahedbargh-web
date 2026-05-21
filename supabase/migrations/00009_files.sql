-- Migration 00009: File tables — elect_project_files, user_files

CREATE TABLE elect_project_files (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  elect_project_id uuid NOT NULL REFERENCES elect_projects(id),
  name             text,
  description      text,
  file_type        smallint NOT NULL DEFAULT 0,  -- FileElectProjectType
  storage_path     text NOT NULL,                 -- Supabase Storage path
  user_id          uuid REFERENCES auth.users(id),
  to_user_id       uuid REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_epf_project ON elect_project_files(elect_project_id);
CREATE INDEX idx_epf_client  ON elect_project_files(client_id);

CREATE TABLE user_files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id),
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  name         text,
  file_type    smallint NOT NULL DEFAULT 0,  -- UserFileTypeEnum
  storage_path text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_files_user   ON user_files(user_id);
CREATE INDEX idx_user_files_client ON user_files(client_id);
