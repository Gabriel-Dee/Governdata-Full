ALTER TABLE policy_versions
    ADD COLUMN IF NOT EXISTS scope_key VARCHAR(64) NOT NULL DEFAULT 'GLOBAL',
    ADD COLUMN IF NOT EXISTS effective_from TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS effective_to TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS policy_metadata JSONB NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_versions_active_scope
    ON policy_versions(policy_id, scope_key)
    WHERE active = true;
