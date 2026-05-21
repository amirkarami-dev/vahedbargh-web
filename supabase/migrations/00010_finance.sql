-- Migration 00010: Finance tables
--   transactions, bank_transactions, invoices,
--   eng_payment_tasks, eng_payment_lists, eng_quota_burns

CREATE TABLE bank_transactions (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                  uuid NOT NULL REFERENCES clients(id),
  gateway_type               smallint NOT NULL DEFAULT 0,
  token                      text,
  payment_id                 text,
  request_id                 text,
  amount                     numeric(18,2),
  acceptor_id                text,
  retrieval_reference_number text,
  system_trace_audit_number  text,
  masked_pan                 text,
  sha256_of_pan              text,
  confirmed                  boolean NOT NULL DEFAULT false,
  created_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES clients(id),
  user_id             uuid REFERENCES auth.users(id),
  elect_project_id    uuid REFERENCES elect_projects(id),
  amount              numeric(18,2) NOT NULL DEFAULT 0,
  gateway_type        smallint NOT NULL DEFAULT 0,
  transaction_type    smallint NOT NULL DEFAULT 0,
  status              smallint NOT NULL DEFAULT 0,
  bank_transaction_id uuid REFERENCES bank_transactions(id),
  description         text,
  solar_created       text,
  julian_created      text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz
);

CREATE INDEX idx_transactions_client  ON transactions(client_id);
CREATE INDEX idx_transactions_user    ON transactions(user_id);
CREATE INDEX idx_transactions_project ON transactions(elect_project_id);

CREATE TABLE invoices (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          uuid NOT NULL REFERENCES clients(id),
  elect_project_id   uuid REFERENCES elect_projects(id),
  epp_id             uuid REFERENCES elect_project_processes(id),
  transaction_id     uuid REFERENCES transactions(id),
  amount             numeric(18,2) NOT NULL DEFAULT 0,
  amount_supervision numeric(18,2) NOT NULL DEFAULT 0,
  invoice_status     smallint NOT NULL DEFAULT 0,
  invoice_pay_type   smallint NOT NULL DEFAULT 0,
  solar_created      text,
  julian_created     text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz
);

CREATE TABLE eng_payment_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES clients(id),
  description text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz
);

CREATE TABLE eng_payment_lists (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid NOT NULL REFERENCES clients(id),
  engineer_id          uuid NOT NULL REFERENCES engineers(id),
  eng_payment_task_id  uuid REFERENCES eng_payment_tasks(id),
  transaction_id       uuid REFERENCES transactions(id),
  amount_system        numeric(18,2) NOT NULL DEFAULT 0,
  deduction_1          numeric(18,2) NOT NULL DEFAULT 0,  -- 5% maliyat
  deduction_2          numeric(18,2) NOT NULL DEFAULT 0,  -- 1% sandogh
  deduction_3          numeric(18,2) NOT NULL DEFAULT 0,  -- 7% vahed bargh
  deduction_4          numeric(18,2) NOT NULL DEFAULT 0,  -- 10% afzodeh
  addition_1           numeric(18,2) NOT NULL DEFAULT 0,
  addition_2           numeric(18,2) NOT NULL DEFAULT 0,
  sum_amount_system    numeric(18,2) NOT NULL DEFAULT 0,
  sum_amount_with_fish numeric(18,2) NOT NULL DEFAULT 0,
  bank_account_number  text,
  pay_by_bank_receipt  text,
  is_approved          boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz
);

CREATE TABLE eng_quota_burns (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid NOT NULL REFERENCES clients(id),
  engineer_id             uuid NOT NULL REFERENCES engineers(id),
  quarter_tariff_id       uuid REFERENCES quarter_tariffs(id),
  amount_remaining        numeric(10,2) NOT NULL DEFAULT 0,
  amount_burning          numeric(10,2) NOT NULL DEFAULT 0,
  ert_count_remaining     int NOT NULL DEFAULT 0,
  ert_count_burning       int NOT NULL DEFAULT 0,
  inspection_delay_factor numeric(10,4) NOT NULL DEFAULT 1,
  ert_delay_factor        numeric(10,4) NOT NULL DEFAULT 1,
  is_approved             boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz
);
