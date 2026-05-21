-- Migration 00002: Lookup tables — provinces, cities, sections
-- Seed data for Kurdistan Province, Iran

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

-- ─── Province ────────────────────────────────────────────────────────────────
INSERT INTO provinces (id, name) VALUES
  (10, 'کردستان');

-- ─── Cities ──────────────────────────────────────────────────────────────────
INSERT INTO cities (id, name, province_id) VALUES
  (101, 'سنندج',      10),
  (102, 'مریوان',     10),
  (103, 'سقز',        10),
  (104, 'بیجار',      10),
  (105, 'دهگلان',     10),
  (106, 'کامیاران',   10),
  (107, 'بانه',       10),
  (108, 'سروآباد',    10),
  (109, 'دیواندره',   10),
  (110, 'قروه',       10);

-- ─── Sections ─────────────────────────────────────────────────────────────────
-- Sanandaj (101)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10101, 'منطقه یک سنندج',    101),
  (10102, 'منطقه دو سنندج',    101),
  (10103, 'منطقه سه سنندج',    101),
  (10104, 'منطقه چهار سنندج',  101),
  (10105, 'منطقه پنج سنندج',   101);

-- Marivan (102)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10201, 'منطقه یک مریوان',   102),
  (10202, 'منطقه دو مریوان',   102),
  (10203, 'منطقه سه مریوان',   102);

-- Saqqez (103)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10301, 'منطقه یک سقز',      103),
  (10302, 'منطقه دو سقز',      103),
  (10303, 'منطقه سه سقز',      103);

-- Bijar (104)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10401, 'منطقه یک بیجار',    104),
  (10402, 'منطقه دو بیجار',    104),
  (10403, 'منطقه سه بیجار',    104);

-- Dehgolan (105)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10501, 'منطقه یک دهگلان',   105),
  (10502, 'منطقه دو دهگلان',   105),
  (10503, 'منطقه سه دهگلان',   105);

-- Kamyaran (106)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10601, 'منطقه یک کامیاران',  106),
  (10602, 'منطقه دو کامیاران',  106),
  (10603, 'منطقه سه کامیاران',  106);

-- Baneh (107)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10701, 'منطقه یک بانه',     107),
  (10702, 'منطقه دو بانه',     107),
  (10703, 'منطقه سه بانه',     107);

-- Sarvabad (108)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10801, 'منطقه یک سروآباد',  108),
  (10802, 'منطقه دو سروآباد',  108),
  (10803, 'منطقه سه سروآباد',  108);

-- Divandarreh (109)
INSERT INTO sections (id, section_name, city_id) VALUES
  (10901, 'منطقه یک دیواندره', 109),
  (10902, 'منطقه دو دیواندره', 109),
  (10903, 'منطقه سه دیواندره', 109);

-- Qorveh (110)
INSERT INTO sections (id, section_name, city_id) VALUES
  (11001, 'منطقه یک قروه',     110),
  (11002, 'منطقه دو قروه',     110),
  (11003, 'منطقه سه قروه',     110);
