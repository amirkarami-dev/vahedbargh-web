-- Migration 00005: Tariff tables — quarter_tariffs, building_tariffs, ert_tariffs

CREATE TABLE quarter_tariffs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES clients(id),
  quarter_type          smallint NOT NULL,   -- QuarterTypeEnum: 1=Q1 2=Q2 3=Q3 4=Q4
  year                  smallint NOT NULL,
  allotment_round_type  smallint NOT NULL DEFAULT 0,
  fee                   numeric(18,2) NOT NULL DEFAULT 0,
  ert_fee               numeric(18,2) NOT NULL DEFAULT 0,
  test_and_delivery_fee numeric(18,2) NOT NULL DEFAULT 0,
  count_ert             int NOT NULL DEFAULT 0,
  count_test_delivery   int NOT NULL DEFAULT 0,
  is_quota              boolean NOT NULL DEFAULT false,
  period                text,
  percent_increase      numeric(5,2) NOT NULL DEFAULT 0,
  ert_approved_fee      numeric(18,2) NOT NULL DEFAULT 0,
  add_dif_days          int NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz
);

CREATE TABLE building_tariffs (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              uuid NOT NULL REFERENCES clients(id),
  building_group_type    smallint NOT NULL,  -- BuildingGroupTypeEnum
  building_group_param   smallint NOT NULL,  -- BuildingGroupParameterTypeEnum
  tariff                 numeric(18,2) NOT NULL DEFAULT 0,
  min_tariff             numeric(18,2) NOT NULL DEFAULT 0,
  factor                 numeric(10,4) NOT NULL DEFAULT 1,
  test_delivery_factor   numeric(10,4) NOT NULL DEFAULT 1,
  supervision_tariff     numeric(18,2) NOT NULL DEFAULT 0,
  supervision_min_tariff numeric(18,2) NOT NULL DEFAULT 0,
  supervision_factor     numeric(10,4) NOT NULL DEFAULT 1,
  solar_year             text,
  solar_date             text,
  effective_at           timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz
);

CREATE TABLE ert_tariffs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id),
  ert_system_type smallint NOT NULL,  -- ErtSystemTypeEnum
  tariff          numeric(18,2) NOT NULL DEFAULT 0,
  factor          numeric(10,4) NOT NULL DEFAULT 1,
  solar_date      text,
  effective_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz
);
