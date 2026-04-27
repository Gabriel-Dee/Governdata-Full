package com.governdata.governdata.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationDecision {

    public enum Decision {
        ALLOW,
        DENY
    }

    private Decision decision;
    private String engine;
    /** Policy version hash (e.g. content_hash from policy_versions). */
    private String policyVersion;
    /** Policy version entity ID for FK in decisions table (policy engines only). */
    private Long policyVersionId;
    private String evidenceId;
    private String reason;

    /** Runtime used for policy evaluation (JSON or OPA). */
    private String runtimeUsed;
    /** Unique trace ID for a policy evaluation call. */
    private String evaluationTraceId;
}
