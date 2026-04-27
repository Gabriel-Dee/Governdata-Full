ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS primary_contact_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS primary_contact_title VARCHAR(128);

COMMENT ON COLUMN tenants.primary_contact_name IS 'Optional name of org representative (e.g. IT director) at provisioning.';
COMMENT ON COLUMN tenants.primary_contact_title IS 'Optional job title of org representative.';
