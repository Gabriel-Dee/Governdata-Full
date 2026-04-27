package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_request_id", nullable = false)
    private AuthorizationRequestEntity authorizationRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id", nullable = false)
    private DecisionEntity decisionRef;

    @Column(name = "engine_used", nullable = false, length = 32)
    private String engineUsed;

    @Column(name = "policy_version_hash", length = 64)
    private String policyVersionHash;

    @Column(name = "decision", nullable = false, length = 16)
    private String decisionOutcome;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
