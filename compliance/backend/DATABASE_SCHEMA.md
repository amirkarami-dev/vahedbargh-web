# Database Schema Migration
## SQL Server → Supabase PostgreSQL

> Source: vahedbargh-api-9 EF Core entities + Persistence/Configurations/  
> Target: Supabase PostgreSQL (self-hosted)

---

## Conventions

| SQL Server | PostgreSQL |
|---|---|
| `uniqueidentifier` (Guid) | `uuid DEFAULT gen_random_uuid()` |
| `nvarchar(n)` | `text` or `varchar(n)` |
| `bit` | `boolean` |
| `datetime2` | `timestamptz` |
| `decimal(18,2)` | `numeric(18,2)` |
| `int` enum | `smallint` + check constraint |
| `geography` (Point) | `geography(Point, 4326)` (PostGIS) |
| PascalCase table/column | snake_case |
| Shadow props `Created/LastModified` | `created_at timestamptz DEFAULT now()`, `updated_at timestamptz` |

---

## 0. Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

---

## 1. Lookup / Seed Tables

```sql
CREATE TABLE provinces (
  id   smallint PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE cities (
  id          smallint PRIMARY KEY,
  name        text NOT NULL,
  province_id smallint REFERENCES provinces(id)
);

CREATE TABLE sections (
  id           smallint PRIMARY KEY,
  section_name text NOT NULL,
  city_id      smallint REFERENCES cities(id)
);
```

---

## 2. Clients (Tenants)

```sql
CREATE TABLE clients (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  subdomain          text NOT NULL UNIQUE,
  abn                text,
  company_type       text,
  staff_range        text,
  chat_url           text,
  rocket_chat_token  text,
  rocket_chat_id     text,
  api_key            text,
  balance            numeric(18,2) NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz
);

CREATE TABLE client_settings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES clients(id),
  welcome_message     text,
  goodbye_message     text,
  break_start         time,
  break_end           time,
  work_start          time,
  work_end            time,
  work_days           text,  -- comma-separated days
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz
);

CREATE TABLE client_areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES clients(id),
  name        text NOT NULL,
  area_type   smallint NOT NULL DEFAULT 0, -- 0=Polygon, 1=Circle
  radius      numeric,
  center_lat  double precision,
  center_lng  double precision,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE client_area_points (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id     uuid NOT NULL REFERENCES client_areas(id) ON DELETE CASCADE,
  lat         double precision NOT NULL,
  lng         double precision NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);
```

---

## 3. User Profiles (extends auth.users)

```sql
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id       uuid REFERENCES clients(id),
  first_name      text,
  last_name       text,
  national_code   text,
  phone_number    text,
  avatar_url      text,
  section_id      smallint REFERENCES sections(id),
  city_id         smallint REFERENCES cities(id),
  user_type       smallint NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  expiry_date     timestamptz,
  score           int NOT NULL DEFAULT 0,
  bale_id         text,
  integrate_id    text,
  nick_name       text,
  theme_color     text DEFAULT '#3B82F6',
  legacy_hash     text,  -- temporary during password migration
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

CREATE TABLE user_roles (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL,
  client_id  uuid NOT NULL REFERENCES clients(id),
  PRIMARY KEY (user_id, role, client_id)
);
```

---

## 4. Tariffs

```sql
CREATE TABLE quarter_tariffs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid NOT NULL REFERENCES clients(id),
  quarter_type            smallint NOT NULL,  -- QuarterTypeEnum
  year                    smallint NOT NULL,
  allotment_round_type    smallint NOT NULL DEFAULT 0,
  fee                     numeric(18,2) NOT NULL DEFAULT 0,
  ert_fee                 numeric(18,2) NOT NULL DEFAULT 0,
  test_and_delivery_fee   numeric(18,2) NOT NULL DEFAULT 0,
  count_ert               int NOT NULL DEFAULT 0,
  count_test_delivery     int NOT NULL DEFAULT 0,
  is_quota                boolean NOT NULL DEFAULT false,
  period                  text,
  percent_increase        numeric(5,2) NOT NULL DEFAULT 0,
  ert_approved_fee        numeric(18,2) NOT NULL DEFAULT 0,
  add_dif_days            int NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz
);

CREATE TABLE building_tariffs (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                uuid NOT NULL REFERENCES clients(id),
  building_group_type      smallint NOT NULL,   -- BuildingGroupTypeEnum
  building_group_param     smallint NOT NULL,   -- BuildingGroupParameterTypeEnum
  tariff                   numeric(18,2) NOT NULL DEFAULT 0,
  min_tariff               numeric(18,2) NOT NULL DEFAULT 0,
  factor                   numeric(10,4) NOT NULL DEFAULT 1,
  test_delivery_factor     numeric(10,4) NOT NULL DEFAULT 1,
  supervision_tariff       numeric(18,2) NOT NULL DEFAULT 0,
  supervision_min_tariff   numeric(18,2) NOT NULL DEFAULT 0,
  supervision_factor       numeric(10,4) NOT NULL DEFAULT 1,
  solar_year               text,
  solar_date               text,
  effective_at             timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz
);

CREATE TABLE ert_tariffs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  ert_system_type  smallint NOT NULL,  -- ErtSystemTypeEnum
  tariff           numeric(18,2) NOT NULL DEFAULT 0,
  factor           numeric(10,4) NOT NULL DEFAULT 1,
  solar_date       text,
  effective_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz
);
```

---

## 5. Engineers

```sql
CREATE TABLE engineers (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES clients(id),
  user_id               uuid REFERENCES auth.users(id),
  full_name             text NOT NULL,
  na_code               text,
  cell_phone            text,
  email                 text,
  dad_name              text,
  tell                  text,
  address               text,
  section_id            smallint REFERENCES sections(id),
  field_type            smallint NOT NULL DEFAULT 0,   -- FieldTypeEnum
  education_type        smallint NOT NULL DEFAULT 0,
  marital_status_type   smallint NOT NULL DEFAULT 0,
  related_type          smallint NOT NULL DEFAULT 0,
  bank_account_number   text,
  default_quota         numeric(10,2) NOT NULL DEFAULT 0,
  cert_of_test          boolean NOT NULL DEFAULT false,
  cert_of_earth         boolean NOT NULL DEFAULT false,
  cert_of_fiber         boolean NOT NULL DEFAULT false,
  cert_of_inspection    boolean NOT NULL DEFAULT false,
  inactive              boolean NOT NULL DEFAULT false,
  is_delete             boolean NOT NULL DEFAULT false,
  sort_index            int NOT NULL DEFAULT 0,
  bank_account_blocked  boolean NOT NULL DEFAULT false,
  has_1_percent         boolean NOT NULL DEFAULT false,
  has_quarter_increase  boolean NOT NULL DEFAULT false,
  solar_birth_date      text,
  solar_membership_date text,
  julian_birth_date     text,
  julian_membership_date text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);

CREATE TABLE engineer_histories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id  uuid NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
  client_id    uuid NOT NULL REFERENCES clients(id),
  description  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

---

## 6. Executors & Panel Makers

```sql
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
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid NOT NULL REFERENCES clients(id),
  user_id              uuid REFERENCES auth.users(id),
  na_code              text,
  full_name            text NOT NULL,
  mobile_number        text,
  tel                  text,
  is_active            boolean NOT NULL DEFAULT true,
  company_name         text,
  company_code         text,
  license_number       text,
  signature_file_name  text,
  province_name        text,
  city_name            text,
  address              text,
  section_id           smallint REFERENCES sections(id),
  more_info            text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz
);
```

---

## 7. Elect Projects (Core)

```sql
CREATE TABLE elect_projects (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                  uuid NOT NULL REFERENCES clients(id),
  file_number                text,
  elect_request_number       text,
  user_id                    uuid REFERENCES auth.users(id),
  section_id                 smallint REFERENCES sections(id),
  city_id                    smallint REFERENCES cities(id),
  province_id                smallint REFERENCES provinces(id),
  address                    text,
  postal_code                text,
  lat                        double precision,
  lng                        double precision,
  geo_point                  geography(Point, 4326),
  landlord_name              text,
  landlord_na_code           text,
  landlord_phone_number      text,
  company_name               text,
  license_number             text,
  description                text,
  number_of_floor            int NOT NULL DEFAULT 1,
  des_number_of_floor        int,
  project_created_type       smallint NOT NULL DEFAULT 0,
  project_type_request       smallint NOT NULL DEFAULT 0,
  project_level              smallint NOT NULL DEFAULT 0,  -- 0-9 stages
  building_type              smallint NOT NULL DEFAULT 0,
  elect_project_status       smallint NOT NULL DEFAULT 0,
  is_ok                      boolean NOT NULL DEFAULT false,
  is_stop                    boolean NOT NULL DEFAULT false,
  is_delete                  boolean NOT NULL DEFAULT false,
  expired                    boolean NOT NULL DEFAULT false,
  panel_need                 boolean NOT NULL DEFAULT false,
  panel_maker_submit         boolean NOT NULL DEFAULT false,
  is_earth_system            boolean NOT NULL DEFAULT false,
  is_ert_test                boolean NOT NULL DEFAULT false,
  is_building_inspection     boolean NOT NULL DEFAULT false,
  is_test_and_delivery       boolean NOT NULL DEFAULT false,
  need_elect_network         boolean NOT NULL DEFAULT false,
  is_big_project             boolean NOT NULL DEFAULT false,
  amount_per_area            numeric(18,2),
  foundation_electrode_area  numeric(10,4),
  is_need_eb                 boolean NOT NULL DEFAULT false,
  has_related_permit         boolean NOT NULL DEFAULT false,
  has_supervision            boolean NOT NULL DEFAULT false,
  area_as_built              numeric(10,2),
  defect_des                 text,
  is_defect_eng              boolean NOT NULL DEFAULT false,
  solved_defect_eng          boolean NOT NULL DEFAULT false,
  supervisor_name            text,
  supervisor_phone_number    text,
  panel_serial_number        text,
  stop_des                   text,
  parent_project_id          uuid REFERENCES elect_projects(id),
  building_tariff_id         uuid REFERENCES building_tariffs(id),
  ert_tariff_id              uuid REFERENCES ert_tariffs(id),
  panel_maker_id             uuid REFERENCES panel_makers(id),
  solar_created              text,
  julian_created             text,
  solar_submitted            text,
  julian_submitted           text,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz
);

CREATE INDEX idx_elect_projects_client    ON elect_projects(client_id);
CREATE INDEX idx_elect_projects_status    ON elect_projects(elect_project_status);
CREATE INDEX idx_elect_projects_level     ON elect_projects(project_level);
CREATE INDEX idx_elect_projects_user      ON elect_projects(user_id);
CREATE INDEX idx_elect_projects_section   ON elect_projects(section_id);
CREATE INDEX idx_elect_projects_file_num  ON elect_projects(file_number);

-- Full-text search (Persian)
CREATE INDEX idx_elect_projects_fts ON elect_projects
  USING gin(to_tsvector('simple',
    coalesce(file_number,'') || ' ' ||
    coalesce(landlord_name,'') || ' ' ||
    coalesce(elect_request_number,'')
  ));
```

---

## 8. Project Processes (EPP)

```sql
CREATE TABLE elect_project_processes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES clients(id),
  elect_project_id    uuid NOT NULL REFERENCES elect_projects(id),
  engineer_id         uuid REFERENCES engineers(id),
  project_level       smallint NOT NULL DEFAULT 0,
  building_tariff_id  uuid REFERENCES building_tariffs(id),
  quarter_tariff_id   uuid REFERENCES quarter_tariffs(id),
  inspection_status   smallint NOT NULL DEFAULT 0,  -- InspectionStatusEnum
  defect              text,
  fee                 numeric(18,2) NOT NULL DEFAULT 0,
  accepted            boolean NOT NULL DEFAULT false,
  description         text,
  is_main             boolean NOT NULL DEFAULT false,
  is_delete           boolean NOT NULL DEFAULT false,
  solar_assigned      text,
  julian_assigned     text,
  solar_accepted      text,
  julian_accepted     text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz
);

CREATE INDEX idx_epp_project ON elect_project_processes(elect_project_id);
CREATE INDEX idx_epp_engineer ON elect_project_processes(engineer_id);
CREATE INDEX idx_epp_client ON elect_project_processes(client_id);
```

---

## 9. Project Forms

```sql
CREATE TABLE comment_eng_forms (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES clients(id),
  epp_id              uuid NOT NULL REFERENCES elect_project_processes(id),
  elect_project_id    uuid NOT NULL REFERENCES elect_projects(id),
  branching_type      smallint NOT NULL DEFAULT 0,
  faz_number          smallint NOT NULL DEFAULT 0,
  branching_count     int,
  ampere              numeric(10,2),
  power               numeric(10,2),
  power_sum           numeric(10,2),
  description         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz
);

CREATE TABLE check_list_forms (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid NOT NULL REFERENCES clients(id),
  epp_id               uuid NOT NULL REFERENCES elect_project_processes(id),
  elect_project_id     uuid NOT NULL REFERENCES elect_projects(id),
  solar_checked        text,
  inspection_des       smallint NOT NULL DEFAULT 0,  -- InspectionDesEnum
  is_complete          boolean NOT NULL DEFAULT false,
  result_des           text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz
);

CREATE TABLE check_list_edcs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES clients(id),
  epp_id            uuid NOT NULL REFERENCES elect_project_processes(id),
  elect_project_id  uuid NOT NULL REFERENCES elect_projects(id),
  checklist_items   jsonb NOT NULL DEFAULT '{}',  -- CheckListEdcEnum values
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz
);

CREATE TABLE elect_project_ert_forms (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid NOT NULL REFERENCES clients(id),
  elect_project_id        uuid NOT NULL REFERENCES elect_projects(id),
  epp_id                  uuid REFERENCES elect_project_processes(id),
  -- ~30 technical ERT fields
  electrode_type          smallint,
  electrode_material      text,
  electrode_length        numeric(10,3),
  electrode_diameter      numeric(10,3),
  electrode_depth         numeric(10,3),
  utm_x                   numeric(12,4),
  utm_y                   numeric(12,4),
  resistance_value        numeric(10,4),
  measurement_conditions  text,
  test_equipment          text,
  test_date               text,
  inspector_name          text,
  additional_data         jsonb DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz
);
```

---

## 10. Files

```sql
CREATE TABLE elect_project_files (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  elect_project_id uuid NOT NULL REFERENCES elect_projects(id),
  name             text,
  description      text,
  file_type        smallint NOT NULL DEFAULT 0,  -- FileElectProjectType
  storage_path     text NOT NULL,  -- Supabase Storage path
  user_id          uuid REFERENCES auth.users(id),
  to_user_id       uuid REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id),
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  name         text,
  file_type    smallint NOT NULL DEFAULT 0,  -- UserFileTypeEnum
  storage_path text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

---

## 11. Finance

```sql
CREATE TABLE transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  user_id          uuid REFERENCES auth.users(id),
  elect_project_id uuid REFERENCES elect_projects(id),
  amount           numeric(18,2) NOT NULL DEFAULT 0,
  gateway_type     smallint NOT NULL DEFAULT 0,
  transaction_type smallint NOT NULL DEFAULT 0,
  status           smallint NOT NULL DEFAULT 0,
  bank_transaction_id uuid,
  description      text,
  solar_created    text,
  julian_created   text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz
);

CREATE TABLE bank_transactions (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                   uuid NOT NULL REFERENCES clients(id),
  gateway_type                smallint NOT NULL DEFAULT 0,
  token                       text,
  payment_id                  text,
  request_id                  text,
  amount                      numeric(18,2),
  acceptor_id                 text,
  retrieval_reference_number  text,
  system_trace_audit_number   text,
  masked_pan                  text,
  sha256_of_pan               text,
  confirmed                   boolean NOT NULL DEFAULT false,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ADD CONSTRAINT fk_bank_transaction
  FOREIGN KEY (bank_transaction_id) REFERENCES bank_transactions(id);

CREATE TABLE invoices (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES clients(id),
  elect_project_id      uuid REFERENCES elect_projects(id),
  epp_id                uuid REFERENCES elect_project_processes(id),
  transaction_id        uuid REFERENCES transactions(id),
  amount                numeric(18,2) NOT NULL DEFAULT 0,
  amount_supervision    numeric(18,2) NOT NULL DEFAULT 0,
  invoice_status        smallint NOT NULL DEFAULT 0,
  invoice_pay_type      smallint NOT NULL DEFAULT 0,
  solar_created         text,
  julian_created        text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);

CREATE TABLE eng_payment_tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id),
  description  text,
  is_approved  boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz
);

CREATE TABLE eng_payment_lists (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              uuid NOT NULL REFERENCES clients(id),
  engineer_id            uuid NOT NULL REFERENCES engineers(id),
  eng_payment_task_id    uuid REFERENCES eng_payment_tasks(id),
  transaction_id         uuid REFERENCES transactions(id),
  amount_system          numeric(18,2) NOT NULL DEFAULT 0,
  deduction_1            numeric(18,2) NOT NULL DEFAULT 0,  -- 5%
  deduction_2            numeric(18,2) NOT NULL DEFAULT 0,  -- 1% sandogh
  deduction_3            numeric(18,2) NOT NULL DEFAULT 0,  -- 7% vahed bargh
  deduction_4            numeric(18,2) NOT NULL DEFAULT 0,  -- 10% afzodeh
  addition_1             numeric(18,2) NOT NULL DEFAULT 0,
  addition_2             numeric(18,2) NOT NULL DEFAULT 0,
  sum_amount_system      numeric(18,2) NOT NULL DEFAULT 0,
  sum_amount_with_fish   numeric(18,2) NOT NULL DEFAULT 0,
  bank_account_number    text,
  pay_by_bank_receipt    text,
  is_approved            boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz
);

CREATE TABLE eng_quota_burns (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              uuid NOT NULL REFERENCES clients(id),
  engineer_id            uuid NOT NULL REFERENCES engineers(id),
  quarter_tariff_id      uuid REFERENCES quarter_tariffs(id),
  amount_remaining       numeric(10,2) NOT NULL DEFAULT 0,
  amount_burning         numeric(10,2) NOT NULL DEFAULT 0,
  ert_count_remaining    int NOT NULL DEFAULT 0,
  ert_count_burning      int NOT NULL DEFAULT 0,
  inspection_delay_factor numeric(10,4) NOT NULL DEFAULT 1,
  ert_delay_factor       numeric(10,4) NOT NULL DEFAULT 1,
  is_approved            boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz
);
```

---

## 12. Support / Ticketing

```sql
CREATE TABLE supports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id),
  user_id         uuid NOT NULL REFERENCES auth.users(id),
  to_user_id      uuid REFERENCES auth.users(id),
  ticket_number   text,
  user_type       smallint NOT NULL DEFAULT 0,
  title           text NOT NULL,
  file_number     text,
  rate            smallint,
  is_read         boolean NOT NULL DEFAULT false,
  closed          boolean NOT NULL DEFAULT false,
  field_1         text,
  field_2         text,
  solar_created   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);

CREATE TABLE support_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id),
  support_id   uuid NOT NULL REFERENCES supports(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id),
  message      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE support_files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id),
  support_id   uuid NOT NULL REFERENCES supports(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  name         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

---

## 13. Site Settings (already implemented)

```sql
-- Already in Supabase (Sprint 0):
CREATE TABLE site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 14. Notifications

```sql
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES clients(id),
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  title       text NOT NULL,
  body        text,
  type        text NOT NULL DEFAULT 'info',
  is_read     boolean NOT NULL DEFAULT false,
  payload     jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

---

## 15. Audit Log

```sql
CREATE TABLE audit_logs (
  id          bigserial PRIMARY KEY,
  client_id   uuid REFERENCES clients(id),
  user_id     uuid REFERENCES auth.users(id),
  action      text NOT NULL,
  entity      text NOT NULL,
  entity_id   text,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  inet,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

---

## Updated_at Trigger (apply to all mutable tables)

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table that has updated_at, e.g.:
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Migration Export Script (SQL Server → CSV)

```sql
-- Run in SQL Server Management Studio or sqlcmd

-- Example for elect_projects:
SELECT
  LOWER(CONVERT(varchar(36), Id))            AS id,
  LOWER(CONVERT(varchar(36), ClientId))      AS client_id,
  FileNumber                                  AS file_number,
  ElectRequestNumber                          AS elect_request_number,
  NumberOfFloor                               AS number_of_floor,
  Address                                     AS address,
  LandlordName                                AS landlord_name,
  LandlordNaCode                              AS landlord_na_code,
  LandlordPhoneNumber                         AS landlord_phone_number,
  CAST(ProjectLevel AS smallint)              AS project_level,
  CAST(ElectProjectStatus AS smallint)        AS elect_project_status,
  CAST(IsOk AS bit)                           AS is_ok,
  SolarCreated                                AS solar_created,
  Created                                     AS created_at
FROM ElectProjects
WHERE IsDelete = 0
```

---

## Useful Queries After Migration

```sql
-- Verify row counts match SQL Server
SELECT
  'elect_projects' AS tbl, count(*) FROM elect_projects
UNION ALL
SELECT 'engineers', count(*) FROM engineers
UNION ALL
SELECT 'transactions', count(*) FROM transactions
UNION ALL
SELECT 'invoices', count(*) FROM invoices;

-- Check orphaned FK references
SELECT id FROM elect_project_processes
WHERE elect_project_id NOT IN (SELECT id FROM elect_projects);

-- Spot-check a specific project
SELECT ep.*, epp.inspection_status, e.full_name AS engineer
FROM elect_projects ep
LEFT JOIN elect_project_processes epp ON epp.elect_project_id = ep.id
LEFT JOIN engineers e ON e.id = epp.engineer_id
WHERE ep.file_number = '1234/5678';
```
