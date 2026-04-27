ALTER TABLE decisions
    ADD CONSTRAINT fk_decisions_policy_version
    FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id);
