-- Set purpose on PatientRecord READ so that purpose validation is exercised (e.g. HIPAA minimum necessary).
-- Only requests with context.purpose = 'TREATMENT' will match this permission.
UPDATE permissions SET purpose = 'TREATMENT' WHERE resource_type = 'PatientRecord' AND action = 'READ';
