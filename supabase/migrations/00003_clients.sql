-- Migration 00003: Clients (Tenants) — clients, client_settings, client_areas, client_area_points

CREATE TABLE clients (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  subdomain         text NOT NULL UNIQUE,
  abn               text,
  company_type      text,
  staff_range       text,
  chat_url          text,
  rocket_chat_token text,
  rocket_chat_id    text,
  api_key           text,
  balance           numeric(18,2) NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz
);

CREATE TABLE client_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id),
  welcome_message text,
  goodbye_message text,
  break_start     time,
  break_end       time,
  work_start      time,
  work_end        time,
  work_days       text,   -- comma-separated days (e.g. '0,1,2,3,4')
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

CREATE TABLE client_areas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  uuid NOT NULL REFERENCES clients(id),
  name       text NOT NULL,
  area_type  smallint NOT NULL DEFAULT 0,  -- 0=Polygon, 1=Circle
  radius     numeric,
  center_lat double precision,
  center_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE client_area_points (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id    uuid NOT NULL REFERENCES client_areas(id) ON DELETE CASCADE,
  lat        double precision NOT NULL,
  lng        double precision NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
