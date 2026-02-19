-- ============================================================
-- DK Living — Seed Script
-- Run in: Supabase SQL Editor
-- Seeds: properties, units, and leases for all 35 LTR units
-- Source: Buildium rent rolls as of 2/14-2/16/2026
-- ============================================================

-- ============================================================
-- STEP 1: Add missing property (2061 Forbes)
-- ============================================================

INSERT INTO properties (id, name, address)
VALUES ('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '2061 Forbes', '2061 Forbes St Jacksonville, FL 32204')
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 2: Update existing 2735 Riverside units with bed/bath
-- ============================================================

UPDATE units SET bed_count = 0, bath_count = 1, monthly_rent = 1350.00, lease_start_date = '2026-02-01', lease_end_date = '2027-02-28'
WHERE id = '0ba710f7-0a4b-49da-b50f-ccf40c39369c'; -- Unit 1, Franzoni

UPDATE units SET bed_count = 1, bath_count = 1, monthly_rent = 0
WHERE id = '1557d1b3-f839-4b20-ba9f-058dd0eb1e01'; -- Unit 1A, VACANT

UPDATE units SET bed_count = 0, bath_count = 1, monthly_rent = 0
WHERE id = '8e6900da-0d28-451e-85e6-7ec1eb90f47d'; -- Unit 2, VACANT

UPDATE units SET bed_count = 0, bath_count = 1, monthly_rent = 1.00, lease_start_date = '2026-02-01', lease_end_date = '2027-01-31'
WHERE id = 'a08e701c-6787-46f8-bd8d-f4ed8d2996df'; -- Unit 2A, DaCosta

UPDATE units SET bed_count = 0, bath_count = 1, monthly_rent = 1450.00, lease_start_date = '2025-12-15', lease_end_date = '2026-12-14'
WHERE id = 'fdbec9a5-2355-44ab-a94a-3a173f4c8141'; -- Unit 3, Schmidt

UPDATE units SET bed_count = 0, bath_count = 1, monthly_rent = 1450.00, lease_start_date = '2025-12-01', lease_end_date = '2026-11-30'
WHERE id = 'b059601d-3569-4cf5-adb1-b6332d808712'; -- Unit 4, Leonardi


-- ============================================================
-- STEP 3: Insert 830 Lasalle units (1-17)
-- ============================================================

INSERT INTO units (property_id, unit_number, bed_count, bath_count, monthly_rent, lease_start_date, lease_end_date) VALUES
('fafd0a16-7bbd-41b6-a091-05887749902d', '1',  2, 1, 2000.00, '2025-05-06', '2026-11-05'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '2',  2, 1, 1775.00, '2021-01-01', '2026-11-30'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '3',  2, 1, 1900.00, '2023-06-16', '2026-06-14'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '4',  2, 1, 1725.00, '2025-08-01', '2026-07-31'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '5',  2, 1, 1675.00, '2025-04-18', '2026-04-17'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '6',  2, 1, 1775.00, '2023-07-18', '2026-03-31'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '7',  2, 1, 1650.00, '2025-07-12', '2026-07-11'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '8',  2, 1, 1725.00, '2023-09-18', NULL),
('fafd0a16-7bbd-41b6-a091-05887749902d', '9',  2, 1, 1500.00, '2025-09-27', '2026-09-26'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '10', 2, 1, 1750.00, '2020-12-01', NULL),
('fafd0a16-7bbd-41b6-a091-05887749902d', '11', 2, 1, 0,       NULL,         NULL),
('fafd0a16-7bbd-41b6-a091-05887749902d', '12', 1, 1, 1450.00, '2025-09-22', '2026-09-21'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '13', 3, 1, 1700.00, '2024-10-11', '2026-10-10'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '14', 3, 1, 1850.00, '2025-05-30', '2026-05-29'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '15', 3, 1, 1875.00, '2025-03-24', '2026-03-23'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '16', 3, 1, 1875.00, '2025-10-20', '2026-10-19'),
('fafd0a16-7bbd-41b6-a091-05887749902d', '17', 1, 1, 1400.00, '2025-03-01', '2026-02-28')
ON CONFLICT (property_id, unit_number) DO UPDATE SET
  bed_count = EXCLUDED.bed_count,
  bath_count = EXCLUDED.bath_count,
  monthly_rent = EXCLUDED.monthly_rent,
  lease_start_date = EXCLUDED.lease_start_date,
  lease_end_date = EXCLUDED.lease_end_date;


-- ============================================================
-- STEP 4: Insert 2061 Forbes units (1-12)
-- ============================================================

INSERT INTO units (property_id, unit_number, bed_count, bath_count, monthly_rent, lease_start_date, lease_end_date) VALUES
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '1',  2, 1, 1650.00, '2023-10-23', '2026-10-22'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '2',  2, 1, 1500.00, '2022-02-01', '2026-02-28'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '3',  2, 1, 1450.00, '2026-02-26', '2027-02-25'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '4',  2, 1, 1450.00, '2024-03-28', '2027-03-27'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '5',  2, 1, 1575.00, '2024-12-13', '2026-12-12'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '6',  2, 1, 1425.00, '2026-02-18', '2027-02-17'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '7',  2, 1, 1750.00, '2025-04-11', '2026-04-10'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '8',  1, 1, 1400.00, '2025-03-10', '2026-03-09'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '9',  2, 1, 1725.00, '2025-03-10', '2026-03-09'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '10', 1, 1, 1175.00, '2021-11-01', '2026-10-31'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '11', 2, 1, 1400.00, '2024-03-18', '2026-03-17'),
('b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab', '12', 1, 1, 1325.00, '2025-01-13', '2026-07-12')
ON CONFLICT (property_id, unit_number) DO UPDATE SET
  bed_count = EXCLUDED.bed_count,
  bath_count = EXCLUDED.bath_count,
  monthly_rent = EXCLUDED.monthly_rent,
  lease_start_date = EXCLUDED.lease_start_date,
  lease_end_date = EXCLUDED.lease_end_date;


-- ============================================================
-- STEP 5: Insert leases for all occupied units
-- ============================================================

-- ---------- 830 LASALLE ----------

-- Unit 1: Lucas DucrotCharbonnier
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Lucas DucrotCharbonnier', '2025-05-06', '2026-11-05', 2000.00, 2000.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '1';

-- Unit 2: Edward Blakey
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Edward Blakey', '2021-01-01', '2026-11-30', 1775.00, 1550.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '2';

-- Unit 3: Miles Igou, Elizabeth Brown
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Miles Igou, Elizabeth Brown', '2023-06-16', '2026-06-14', 1900.00, 1900.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '3';

-- Unit 4: Elbert Ballance
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Elbert Ballance', '2025-08-01', '2026-07-31', 1725.00, 1725.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '4';

-- Unit 5: Billy Morrow, Caroline Morrow
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Billy Morrow, Caroline Morrow', '2025-04-18', '2026-04-17', 1675.00, 1675.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '5';

-- Unit 6: Holli Emery (non-renewal, $6,652.50 balance)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_status, renewal_notes)
SELECT u.id, 'Holli Emery', '2023-07-18', '2026-03-31', 1775.00, 1875.00, 'fixed', 'active', 'not_renewing', 'Non-renewal. Outstanding balance $6,652.50 as of 2/14/2026.'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '6';

-- Unit 7: Briana Blankhorst
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Briana Blankhorst', '2025-07-12', '2026-07-11', 1650.00, 1650.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '7';

-- Unit 8: Nancy Roberts, Donald Roberts (at-will)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Nancy Roberts, Donald Roberts', '2023-09-18', NULL, 1725.00, 1925.00, 'at_will', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '8';

-- Unit 9: Robyn Frank
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Robyn Frank', '2025-09-27', '2026-09-26', 1500.00, 1500.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '9';

-- Unit 10: Kathy Ann Malmquist (at-will)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Kathy Ann Malmquist', '2020-12-01', NULL, 1750.00, 1650.00, 'at_will', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '10';

-- Unit 11: VACANT (no lease)

-- Unit 12: Mack Johnson
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Mack Johnson', '2025-09-22', '2026-09-21', 1450.00, 1450.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '12';

-- Unit 13: Daniella Shedenhelm
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Daniella Shedenhelm', '2024-10-11', '2026-10-10', 1700.00, 1700.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '13';

-- Unit 14: [PLACEHOLDER - update tenant name]
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_notes)
SELECT u.id, 'TBD - Unit 14 Tenant', '2025-05-30', '2026-05-29', 1850.00, 1850.00, 'fixed', 'active', 'Placeholder name - update from Buildium'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '14';

-- Unit 15: [PLACEHOLDER - update tenant name]
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_notes)
SELECT u.id, 'TBD - Unit 15 Tenant', '2025-03-24', '2026-03-23', 1875.00, 1875.00, 'fixed', 'active', 'Placeholder name - update from Buildium'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '15';

-- Unit 16: [PLACEHOLDER - update tenant name]
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_notes)
SELECT u.id, 'TBD - Unit 16 Tenant', '2025-10-20', '2026-10-19', 1875.00, 1875.00, 'fixed', 'active', 'Placeholder name - update from Buildium'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '16';

-- Unit 17: [PLACEHOLDER - update tenant name]
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_notes)
SELECT u.id, 'TBD - Unit 17 Tenant', '2025-03-01', '2026-02-28', 1400.00, 1400.00, 'fixed', 'active', 'Placeholder name - update from Buildium'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '830 Lasalle' AND u.unit_number = '17';


-- ---------- 2061 FORBES ----------

-- Unit 1: Christina Stuller ($2,426.50 balance)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_notes)
SELECT u.id, 'Christina Stuller', '2023-10-23', '2026-10-22', 1650.00, 1650.00, 'fixed', 'active', 'Outstanding balance $2,426.50 as of 2/28/2026.'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '1';

-- Unit 2: Hannah Jensen, Nick Dilts (expiring 2/28/2026)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Hannah Jensen, Nick Dilts', '2022-02-01', '2026-02-28', 1500.00, 1225.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '2';

-- Unit 3: Kaitlyn Mocete, Jessica Ross (new lease)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Kaitlyn Mocete, Jessica Ross', '2026-02-26', '2027-02-25', 1450.00, 1450.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '3';

-- Unit 4: Alexandra Monique Yelvington
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Alexandra Monique Yelvington', '2024-03-28', '2027-03-27', 1450.00, 1450.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '4';

-- Unit 5: Jordan Griffis, Courtney Ardizzoni
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Jordan Griffis, Courtney Ardizzoni', '2024-12-13', '2026-12-12', 1575.00, 2412.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '5';

-- Unit 6: Kate Branch (new lease)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Kate Branch', '2026-02-18', '2027-02-17', 1425.00, 1425.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '6';

-- Unit 7: Brandon Pond, Veronica Fuchs
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Brandon Pond, Veronica Fuchs', '2025-04-11', '2026-04-10', 1750.00, 1750.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '7';

-- Unit 8: Michael Libby (transferring to Unit 9)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_status, renewal_notes)
SELECT u.id, 'Michael Libby', '2025-03-10', '2026-03-09', 1400.00, 1400.00, 'fixed', 'active', 'transferred', 'Transferring to Unit 9 at $1,600/mo effective 3/9/2026.'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '8';

-- Unit 9: Lindsay Long (confirmed moving out 3/9)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_status, renewal_notes)
SELECT u.id, 'Lindsay Long', '2025-03-10', '2026-03-09', 1725.00, 1725.00, 'fixed', 'active', 'not_renewing', 'Confirmed move-out. Libby transferring in at $1,600/mo.'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '9';

-- Unit 10: Arden Brugger
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Arden Brugger', '2021-11-01', '2026-10-31', 1175.00, 0, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '10';

-- Unit 11: April Hernandez, Peter Palmer (expiring 3/17)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'April Hernandez, Peter Palmer', '2024-03-18', '2026-03-17', 1400.00, 1400.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '11';

-- Unit 12: Isahi Avina
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Isahi Avina', '2025-01-13', '2026-07-12', 1325.00, 1325.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2061 Forbes' AND u.unit_number = '12';


-- ---------- 2735 RIVERSIDE ----------

-- Unit 1: Juliana Franzoni
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Juliana Franzoni', '2026-02-01', '2027-02-28', 1350.00, 1350.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2735 Riverside' AND u.unit_number = '1';

-- Unit 1A: VACANT (no lease)

-- Unit 2: VACANT (no lease)

-- Unit 2A: Jered DaCosta (owner unit)
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status, renewal_notes)
SELECT u.id, 'Jered DaCosta', '2026-02-01', '2027-01-31', 1.00, 0, 'fixed', 'active', 'Owner-occupied unit'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2735 Riverside' AND u.unit_number = '2A';

-- Unit 3: Brandon Schmidt
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Brandon Schmidt', '2025-12-15', '2026-12-14', 1450.00, 1450.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2735 Riverside' AND u.unit_number = '3';

-- Unit 4: Lisa Leonardi
INSERT INTO leases (unit_id, tenant_name, lease_start, lease_end, monthly_rent, security_deposit, lease_type, status)
SELECT u.id, 'Lisa Leonardi', '2025-12-01', '2026-11-30', 1450.00, 1450.00, 'fixed', 'active'
FROM units u JOIN properties p ON u.property_id = p.id
WHERE p.name = '2735 Riverside' AND u.unit_number = '4';


-- ============================================================
-- STEP 6: Log lease_created actions for all seeded leases
-- ============================================================

INSERT INTO lease_actions (lease_id, action_type, description, performed_by_name)
SELECT l.id, 'lease_created', 'Seeded from Buildium rent roll — ' || l.tenant_name || ' at $' || l.monthly_rent || '/mo', 'System'
FROM leases l;


-- ============================================================
-- STEP 7: Verify
-- ============================================================

-- Check counts
SELECT 'Properties' AS entity, COUNT(*) AS total FROM properties WHERE name != 'Test Property - Riverside Apartments'
UNION ALL
SELECT 'Units', COUNT(*) FROM units WHERE property_id != '0d5ff71d-a602-4e03-bad0-bc3454fd99df'
UNION ALL
SELECT 'Leases', COUNT(*) FROM leases
UNION ALL
SELECT 'Lease Actions', COUNT(*) FROM lease_actions;
