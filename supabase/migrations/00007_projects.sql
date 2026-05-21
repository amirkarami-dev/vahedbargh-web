-- Migration 00007: elect_projects — core project table with FTS and geo indexes

CREATE TABLE elect_projects (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                 uuid NOT NULL REFERENCES clients(id),
  file_number               text,
  elect_request_number      text,
  user_id                   uuid REFERENCES auth.users(id),
  section_id                smallint REFERENCES sections(id),
  city_id                   smallint REFERENCES cities(id),
  province_id               smallint REFERENCES provinces(id),
  address                   text,
  postal_code               text,
  lat                       double precision,
  lng                       double precision,
  geo_point                 geography(Point, 4326),
  landlord_name             text,
  landlord_na_code          text,
  landlord_phone_number     text,
  company_name              text,
  license_number            text,
  description               text,
  number_of_floor           int NOT NULL DEFAULT 1,
  des_number_of_floor       int,
  project_created_type      smallint NOT NULL DEFAULT 0,
  project_type_request      smallint NOT NULL DEFAULT 0,
  project_level             smallint NOT NULL DEFAULT 0,  -- 0-9 stages
  building_type             smallint NOT NULL DEFAULT 0,
  elect_project_status      smallint NOT NULL DEFAULT 0,
  is_ok                     boolean NOT NULL DEFAULT false,
  is_stop                   boolean NOT NULL DEFAULT false,
  is_delete                 boolean NOT NULL DEFAULT false,
  expired                   boolean NOT NULL DEFAULT false,
  panel_need                boolean NOT NULL DEFAULT false,
  panel_maker_submit        boolean NOT NULL DEFAULT false,
  is_earth_system           boolean NOT NULL DEFAULT false,
  is_ert_test               boolean NOT NULL DEFAULT false,
  is_building_inspection    boolean NOT NULL DEFAULT false,
  is_test_and_delivery      boolean NOT NULL DEFAULT false,
  need_elect_network        boolean NOT NULL DEFAULT false,
  is_big_project            boolean NOT NULL DEFAULT false,
  amount_per_area           numeric(18,2),
  foundation_electrode_area numeric(10,4),
  is_need_eb                boolean NOT NULL DEFAULT false,
  has_related_permit        boolean NOT NULL DEFAULT false,
  has_supervision           boolean NOT NULL DEFAULT false,
  area_as_built             numeric(10,2),
  defect_des                text,
  is_defect_eng             boolean NOT NULL DEFAULT false,
  solved_defect_eng         boolean NOT NULL DEFAULT false,
  supervisor_name           text,
  supervisor_phone_number   text,
  panel_serial_number       text,
  stop_des                  text,
  parent_project_id         uuid REFERENCES elect_projects(id),
  building_tariff_id        uuid REFERENCES building_tariffs(id),
  ert_tariff_id             uuid REFERENCES ert_tariffs(id),
  panel_maker_id            uuid REFERENCES panel_makers(id),
  solar_created             text,
  julian_created            text,
  solar_submitted           text,
  julian_submitted          text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz
);

-- Standard indexes
CREATE INDEX idx_elect_projects_client   ON elect_projects(client_id);
CREATE INDEX idx_elect_projects_status   ON elect_projects(elect_project_status);
CREATE INDEX idx_elect_projects_level    ON elect_projects(project_level);
CREATE INDEX idx_elect_projects_user     ON elect_projects(user_id);
CREATE INDEX idx_elect_projects_section  ON elect_projects(section_id);
CREATE INDEX idx_elect_projects_file_num ON elect_projects(file_number);

-- Full-text search index (simple config works well for Persian/numbers)
CREATE INDEX idx_elect_projects_fts ON elect_projects
  USING gin(to_tsvector('simple',
    coalesce(file_number, '') || ' ' ||
    coalesce(landlord_name, '') || ' ' ||
    coalesce(elect_request_number, '')
  ));

-- Geo spatial index
CREATE INDEX idx_elect_projects_geo ON elect_projects USING gist(geo_point);
