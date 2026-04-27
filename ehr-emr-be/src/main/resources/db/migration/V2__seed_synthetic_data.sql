-- Synthetic data for local testing and experimentation (no real PHI)
INSERT INTO patients (id, mrn, first_name, last_name, dob, gender, address, phone, email, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-4789-a012-000000000001', 'MRN001', 'Alice', 'Smith', '1985-03-15', 'F', '123 Main St', '555-0101', 'alice.smith@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-4789-a012-000000000002', 'MRN002', 'Bob', 'Jones', '1972-07-22', 'M', '456 Oak Ave', '555-0102', 'bob.jones@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-4789-a012-000000000003', 'MRN003', 'Carol', 'Williams', '1990-11-08', 'F', '789 Pine Rd', NULL, 'carol.w@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO encounters (id, patient_id, encounter_date, type, reason, provider_id, location, created_at, updated_at) VALUES
('b2c3d4e5-f6a7-4890-b123-000000000001', 'a1b2c3d4-e5f6-4789-a012-000000000001', CURRENT_TIMESTAMP - INTERVAL '30 days', 'outpatient', 'Annual checkup', 'PROV001', 'Clinic A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b2c3d4e5-f6a7-4890-b123-000000000002', 'a1b2c3d4-e5f6-4789-a012-000000000001', CURRENT_TIMESTAMP - INTERVAL '5 days', 'outpatient', 'Follow-up', 'PROV001', 'Clinic A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b2c3d4e5-f6a7-4890-b123-000000000003', 'a1b2c3d4-e5f6-4789-a012-000000000002', CURRENT_TIMESTAMP - INTERVAL '14 days', 'inpatient', 'Surgery recovery', 'PROV002', 'Hospital B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO diagnoses (id, patient_id, encounter_id, code, description, onset_date, resolved_date, created_at, updated_at) VALUES
('c3d4e5f6-a7b8-4901-c234-000000000001', 'a1b2c3d4-e5f6-4789-a012-000000000001', 'b2c3d4e5-f6a7-4890-b123-000000000001', 'Z00.00', 'Encounter for general adult medical examination', CURRENT_DATE - 30, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c3d4e5f6-a7b8-4901-c234-000000000002', 'a1b2c3d4-e5f6-4789-a012-000000000002', 'b2c3d4e5-f6a7-4890-b123-000000000003', 'E11.9', 'Type 2 diabetes mellitus without complications', CURRENT_DATE - 365, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO medications (id, patient_id, drug_name, dose, route, frequency, start_date, end_date, prescribing_provider_id, created_at, updated_at) VALUES
('d4e5f6a7-b8c9-4012-d345-000000000001', 'a1b2c3d4-e5f6-4789-a012-000000000001', 'Lisinopril', '10 mg', 'oral', 'once daily', CURRENT_DATE - 90, NULL, 'PROV001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d4e5f6a7-b8c9-4012-d345-000000000002', 'a1b2c3d4-e5f6-4789-a012-000000000002', 'Metformin', '500 mg', 'oral', 'twice daily', CURRENT_DATE - 365, NULL, 'PROV002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
