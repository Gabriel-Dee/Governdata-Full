package com.governdata.ehr_emr_be.governance;

/**
 * Client for the Governance Platform. The EHR backend must request
 * authorization before returning or modifying protected data.
 */
public interface GovernanceClient {

    /**
     * Request an authorization decision. Call before any protected read/write.
     *
     * @param request context (userId, patientId, resourceType, action, purposeOfUse)
     * @return decision; if allowed is false, caller must return 403
     */
    AuthorizationResponse authorize(AuthorizationRequest request);

    /**
     * Push normalized audit event to governance audit pipeline.
     */
    void ingestAudit(AuditIngestRequest request);

    /**
     * Verify governance audit evidence by correlation ID.
     */
    AuditIngestResponse verifyAudit(String correlationId);

    /**
     * Revoke access (optional; for future use).
     */
    void revokeAccess(RevokeRequest request);
}
