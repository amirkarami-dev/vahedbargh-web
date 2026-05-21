-- Migration 00011: Support / Ticketing — supports, support_messages, support_files

CREATE TABLE supports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES clients(id),
  user_id       uuid NOT NULL REFERENCES auth.users(id),
  to_user_id    uuid REFERENCES auth.users(id),
  ticket_number text,
  user_type     smallint NOT NULL DEFAULT 0,
  title         text NOT NULL,
  file_number   text,
  rate          smallint,
  is_read       boolean NOT NULL DEFAULT false,
  closed        boolean NOT NULL DEFAULT false,
  field_1       text,
  field_2       text,
  solar_created text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz
);

CREATE INDEX idx_supports_client ON supports(client_id);
CREATE INDEX idx_supports_user   ON supports(user_id);

CREATE TABLE support_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  uuid NOT NULL REFERENCES clients(id),
  support_id uuid NOT NULL REFERENCES supports(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  message    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE support_files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id),
  support_id   uuid NOT NULL REFERENCES supports(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  name         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
