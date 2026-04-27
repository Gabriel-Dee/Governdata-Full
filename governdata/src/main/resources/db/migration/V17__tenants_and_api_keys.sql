CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    tenant_key VARCHAR(64) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO tenants (tenant_key, display_name, active)
SELECT 'legacy', 'Legacy Tenant', TRUE
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_key = 'legacy');

CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    name VARCHAR(128) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE authorization_requests
    ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

UPDATE authorization_requests
SET tenant_id = (SELECT id FROM tenants WHERE tenant_key = 'legacy')
WHERE tenant_id IS NULL;

ALTER TABLE authorization_requests
    ALTER COLUMN tenant_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_authorization_requests_tenant'
    ) THEN
        ALTER TABLE authorization_requests
            ADD CONSTRAINT fk_authorization_requests_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'authorization_requests_request_id_key'
    ) THEN
        ALTER TABLE authorization_requests
            DROP CONSTRAINT authorization_requests_request_id_key;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_authorization_requests_request_tenant'
    ) THEN
        ALTER TABLE authorization_requests
            ADD CONSTRAINT uq_authorization_requests_request_tenant
            UNIQUE (request_id, tenant_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_authorization_requests_tenant_id ON authorization_requests(tenant_id);

ALTER TABLE external_audit_events
    ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

UPDATE external_audit_events
SET tenant_id = (SELECT id FROM tenants WHERE tenant_key = 'legacy')
WHERE tenant_id IS NULL;

ALTER TABLE external_audit_events
    ALTER COLUMN tenant_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_external_audit_events_tenant'
    ) THEN
        ALTER TABLE external_audit_events
            ADD CONSTRAINT fk_external_audit_events_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'external_audit_events_correlation_id_key'
    ) THEN
        ALTER TABLE external_audit_events
            DROP CONSTRAINT external_audit_events_correlation_id_key;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_external_audit_events_corr_tenant'
    ) THEN
        ALTER TABLE external_audit_events
            ADD CONSTRAINT uq_external_audit_events_corr_tenant
            UNIQUE (correlation_id, tenant_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_external_audit_events_tenant_id ON external_audit_events(tenant_id);
