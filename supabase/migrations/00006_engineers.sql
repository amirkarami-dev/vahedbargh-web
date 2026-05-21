-- Migration 00006: Engineers, engineer histories, executors, panel makers

CREATE TABLE engineers (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              uuid NOT NULL REFERENCES clients(id),
  user_id                uuid REFERENCES auth.users(id),
  full_name              text NOT NULL,
  na_code                text,
  cell_phone             text,
  email                  text,
  dad_name               text,
  tell                   text,
  address                text,
  section_id             smallint REFERENCES sections(id),
  field_type             smallint NOT NULL DEFAULT 0,    -- FieldTypeEnum
  education_type         smallint NOT NULL DEFAULT 0,
  marital_status_type    smallint NOT NULL DEFAULT 0,
  related_type           smallint NOT NULL DEFAULT 0,
  bank_account_number    text,
  default_quota          numeric(10,2) NOT NULL DEFAULT 0,
  cert_of_test           boolean NOT NULL DEFAULT false,
  cert_of_earth          boolean NOT NULL DEFAULT false,
  cert_of_fiber          boolean NOT NULL DEFAULT false,
  cert_of_inspection     boolean NOT NULL DEFAULT false,
  inactive               boolean NOT NULL DEFAULT false,
  is_delete              boolean NOT NULL DEFAULT false,
  sort_index             int NOT NULL DEFAULT 0,
  bank_account_blocked   boolean NOT NULL DEFAULT false,
  has_1_percent          boolean NOT NULL DEFAULT false,
  has_quarter_increase   boolean NOT NULL DEFAULT false,
  solar_birth_date       text,
  solar_membership_date  text,
  julian_birth_date      text,
  julian_membership_date text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz
);

CREATE TABLE engineer_histories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
  client_id   uuid NOT NULL REFERENCES clients(id),
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE executors (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid NOT NULL REFERENCES clients(id),
  user_id              uuid REFERENCES auth.users(id),
  ownership_type       smallint NOT NULL DEFAULT 0,
  executor_type        smallint NOT NULL DEFAULT 0,
  executor_grad_type   smallint NOT NULL DEFAULT 0,
  company_name         text,
  full_name            text NOT NULL,
  tel                  text,
  na_code              text,
  cell_phone           text,
  license              text,
  license_number       text,
  section_id           smallint REFERENCES sections(id),
  address              text,
  more_info            text,
  signature_file_name  text,
  license_file_name    text,
  solar_license_expire text,
  inactive             boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz
);

CREATE TABLE panel_makers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES clients(id),
  user_id             uuid REFERENCES auth.users(id),
  na_code             text,
  full_name           text NOT NULL,
  mobile_number       text,
  tel                 text,
  is_active           boolean NOT NULL DEFAULT true,
  company_name        text,
  company_code        text,
  license_number      text,
  signature_file_name text,
  province_name       text,
  city_name           text,
  address             text,
  section_id          smallint REFERENCES sections(id),
  more_info           text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz
);
