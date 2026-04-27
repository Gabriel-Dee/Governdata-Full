package com.governdata.governdata.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditResponseDTO {

    private UUID requestId;
    private SubjectDTO subject;
    private ResourceDTO resource;
    private String action;
    private ContextDTO context;
    private Instant receivedAt;

    private String decision;
    private String engineUsed;
    private String policyVersionHash;
    private String reason;
    private String evidenceId;
    private Integer latencyMs;
    private Instant decisionAt;

    /** Verifiable evidence extensions for cross-system audit integrity. */
    private String eventHash;
    private String chainNetwork;
    private Instant anchorTimestamp;
    private String verificationStatus;
}
