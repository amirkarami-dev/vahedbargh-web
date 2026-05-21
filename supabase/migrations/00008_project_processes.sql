-- Migration 00008: Project process tables
--   elect_project_processes, comment_eng_forms, check_list_forms,
--   check_list_edcs, elect_project_ert_forms

CREATE TABLE elect_project_processes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          uuid NOT NULL REFERENCES clients(id),
  elect_project_id   uuid NOT NULL REFERENCES elect_projects(id),
  engineer_id        uuid REFERENCES engineers(id),
  project_level      smallint NOT NULL DEFAULT 0,
  building_tariff_id uuid REFERENCES building_tariffs(id),
  quarter_tariff_id  uuid REFERENCES quarter_tariffs(id),
  inspection_status  smallint NOT NULL DEFAULT 0,  -- InspectionStatusEnum
  defect             text,
  fee                numeric(18,2) NOT NULL DEFAULT 0,
  accepted           boolean NOT NULL DEFAULT false,
  description        text,
  is_main            boolean NOT NULL DEFAULT false,
  is_delete          boolean NOT NULL DEFAULT false,
  solar_assigned     text,
  julian_assigned    text,
  solar_accepted     text,
  julian_accepted    text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz
);

CREATE INDEX idx_epp_project  ON elect_project_processes(elect_project_id);
CREATE INDEX idx_epp_engineer ON elect_project_processes(engineer_id);
CREATE INDEX idx_epp_client   ON elect_project_processes(client_id);

CREATE TABLE comment_eng_forms (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  epp_id           uuid NOT NULL REFERENCES elect_project_processes(id),
  elect_project_id uuid NOT NULL REFERENCES elect_projects(id),
  branching_type   smallint NOT NULL DEFAULT 0,
  faz_number       smallint NOT NULL DEFAULT 0,
  branching_count  int,
  ampere           numeric(10,2),
  power            numeric(10,2),
  power_sum        numeric(10,2),
  description      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz
);

CREATE TABLE check_list_forms (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  epp_id           uuid NOT NULL REFERENCES elect_project_processes(id),
  elect_project_id uuid NOT NULL REFERENCES elect_projects(id),
  solar_checked    text,
  inspection_des   smallint NOT NULL DEFAULT 0,  -- InspectionDesEnum
  is_complete      boolean NOT NULL DEFAULT false,
  result_des       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz
);

CREATE TABLE check_list_edcs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES clients(id),
  epp_id           uuid NOT NULL REFERENCES elect_project_processes(id),
  elect_project_id uuid NOT NULL REFERENCES elect_projects(id),
  checklist_items  jsonb NOT NULL DEFAULT '{}',  -- CheckListEdcEnum values
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz
);

CREATE TABLE elect_project_ert_forms (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              uuid NOT NULL REFERENCES clients(id),
  elect_project_id       uuid NOT NULL REFERENCES elect_projects(id),
  epp_id                 uuid REFERENCES elect_project_processes(id),
  electrode_type         smallint,
  electrode_material     text,
  electrode_length       numeric(10,3),
  electrode_diameter     numeric(10,3),
  electrode_depth        numeric(10,3),
  utm_x                  numeric(12,4),
  utm_y                  numeric(12,4),
  resistance_value       numeric(10,4),
  measurement_conditions text,
  test_equipment         text,
  test_date              text,
  inspector_name         text,
  additional_data        jsonb DEFAULT '{}',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz
);
