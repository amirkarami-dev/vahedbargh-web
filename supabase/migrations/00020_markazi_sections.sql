-- Migration 00020: Add مرکزی (central) section for each city
--
-- All migrated data uses one "مرکزی" section per city as the default mapping
-- for old EDC sections. The 1001-1010 city scheme is the canonical scheme.
--
-- Section IDs follow the pattern: city_code * 100 + 1 (first section).
-- Sarvabad (city 1010) had no section — added here.
-- Existing ناحیه ۱ — مرکزی sections renamed to just "مرکزی".

-- Add Sarvabad مرکزی (city 1010 had no section)
INSERT INTO sections (id, section_name, city_id)
VALUES (1001, 'مرکزی', 1010)
ON CONFLICT (id) DO NOTHING;

-- Rename existing "ناحیه ۱ — مرکزی" sections to plain "مرکزی"
UPDATE sections
SET section_name = 'مرکزی'
WHERE id IN (101, 201, 301, 401, 501, 601, 701, 801, 901);
