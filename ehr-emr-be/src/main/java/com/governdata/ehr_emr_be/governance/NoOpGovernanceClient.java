package com.governdata.ehr_emr_be.governance;

import java.time.Instant;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * When governance is disabled (e.g. local dev without governance platform),
 * always allow. No outbound call is made.
 */
@Component
@ConditionalOnProperty(name = "governance.client.enabled", havingValue = "false")
public class NoOpGovernanceClient implements GovernanceClient {

    @Override
    public AuthorizationResponse authorize(AuthorizationRequest request) {
        return AuthorizationResponse.allow("governance-disabled", Instant.now().plusSeconds(3600));
    }

    @Override
    public void ingestAudit(AuditIngestRequest request) {
        // no-op
    }

    @Override
    public AuditIngestResponse verifyAudit(String correlationId) {
        return null;
    }

    @Override
    public void revokeAccess(RevokeRequest request) {
        // no-op
    }
}
