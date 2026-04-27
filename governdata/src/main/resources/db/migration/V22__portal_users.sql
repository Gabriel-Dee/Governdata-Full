-- Self-service portal: human login per tenant (Groq-style developer accounts).

CREATE TABLE IF NOT EXISTS portal_users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT uq_portal_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_portal_users_tenant_id ON portal_users(tenant_id);
