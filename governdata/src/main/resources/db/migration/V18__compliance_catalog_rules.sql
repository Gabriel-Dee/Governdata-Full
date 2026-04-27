-- Machine-readable compliance catalog (reference + automated evidence checks).
-- Not a legal certification: integrators supply evidence flags; this service evaluates coverage.
CREATE TABLE compliance_catalog_rules (
    id BIGSERIAL PRIMARY KEY,
    framework VARCHAR(8) NOT NULL CHECK (framework IN ('HIPAA', 'GDPR')),
    rule_code VARCHAR(128) NOT NULL,
    legal_reference VARCHAR(512),
    category VARCHAR(96) NOT NULL,
    title TEXT NOT NULL,
    requirement_type VARCHAR(32),
    description TEXT,
    evidence_key VARCHAR(128),
    automated BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_compliance_framework_code UNIQUE (framework, rule_code)
);

CREATE INDEX idx_compliance_catalog_framework ON compliance_catalog_rules (framework);
CREATE INDEX idx_compliance_catalog_framework_sort ON compliance_catalog_rules (framework, sort_order);

COMMENT ON TABLE compliance_catalog_rules IS 'HIPAA/GDPR-oriented rule catalog; automated rows require matching boolean keys in POST /api/v1/compliance/evaluate evidence map.';
