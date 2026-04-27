-- Organization (tenant) profile fields for provisioning and platform-operator visibility.
ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS primary_contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

COMMENT ON COLUMN tenants.primary_contact_email IS 'Optional IT / security contact at the customer org (set at provisioning).';
COMMENT ON COLUMN tenants.updated_at IS 'Last update timestamp for tenant record.';
