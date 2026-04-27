package com.governdata.ehr_emr_be.governance;

import java.time.Instant;

public record AuthorizationResponse(
        boolean allowed,
        String decisionId,
        String reason,
        Instant expiresAt,
        String decision,
        String runtimeUsed,
        String policyVersion,
        String evaluationTraceId
) {
    public static AuthorizationResponse deny(String reason) {
        return new AuthorizationResponse(false, null, reason, null, "DENY", null, null, null);
    }

    public static AuthorizationResponse allow(String decisionId, Instant expiresAt) {
        return new AuthorizationResponse(true, decisionId, null, expiresAt, "ALLOW", null, null, null);
    }
}
