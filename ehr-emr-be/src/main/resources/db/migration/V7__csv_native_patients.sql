-- Research workflow: patient rows come only from Healthcare data.csv import (not Flyway demo seed).
-- Remove legacy V2 demo patients and relax demographics so CSV-driven rows need no synthetic names.
DELETE FROM audit_event WHERE patient_id IN (
    'a1b2c3d4-e5f6-4789-a012-000000000001'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000002'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000003'::uuid
);
DELETE FROM medications WHERE patient_id IN (
    'a1b2c3d4-e5f6-4789-a012-000000000001'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000002'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000003'::uuid
);
DELETE FROM diagnoses WHERE patient_id IN (
    'a1b2c3d4-e5f6-4789-a012-000000000001'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000002'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000003'::uuid
);
DELETE FROM encounters WHERE patient_id IN (
    'a1b2c3d4-e5f6-4789-a012-000000000001'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000002'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000003'::uuid
);
DELETE FROM patients WHERE id IN (
    'a1b2c3d4-e5f6-4789-a012-000000000001'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000002'::uuid,
    'a1b2c3d4-e5f6-4789-a012-000000000003'::uuid
);

ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE patients ALTER COLUMN mrn DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN dob DROP NOT NULL;
