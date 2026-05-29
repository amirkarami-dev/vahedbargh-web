-- Migration 00019: Widen numeric columns to accommodate production data ranges
--
-- eng_quota_burns.amount_remaining/amount_burning: old data has values up to
--   248,000,000 which overflows numeric(10,2). Widen to numeric(18,2).
--
-- elect_project_ert_forms.utm_x/utm_y: old data contains garbage UTM values
--   up to ~7,198,960,298 (10 digits). Widen from numeric(12,4) to numeric(18,4).

ALTER TABLE eng_quota_burns
  ALTER COLUMN amount_remaining TYPE numeric(18,2),
  ALTER COLUMN amount_burning   TYPE numeric(18,2);

ALTER TABLE elect_project_ert_forms
  ALTER COLUMN utm_x TYPE numeric(18,4),
  ALTER COLUMN utm_y TYPE numeric(18,4);
