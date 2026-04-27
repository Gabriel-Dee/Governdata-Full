package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "decisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_request_id", nullable = false, unique = true)
    private AuthorizationRequestEntity authorizationRequest;

    @Column(name = "engine_type", nullable = false, length = 32)
    private String engineType;

    @Column(nullable = false, length = 16)
    private String decision;

    @Column(name = "reason_text", columnDefinition = "TEXT")
    private String reasonText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_version_id")
    private PolicyVersionEntity policyVersion;

    @Column(name = "evidence_id", length = 255)
    private String evidenceId;

    @Column(name = "latency_ms")
    private Integer latencyMs;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
