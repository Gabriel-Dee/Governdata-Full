package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "policy_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyVersionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private PolicyEntity policy;

    @Column(name = "version_tag", nullable = false, length = 32)
    private String versionTag;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "content_hash", nullable = false, length = 64)
    private String contentHash;

    @Column(nullable = false)
    private Boolean active = false;

    @Column(name = "scope_key", nullable = false, length = 64)
    private String scopeKey = "GLOBAL";

    @Column(name = "effective_from")
    private Instant effectiveFrom;

    @Column(name = "effective_to")
    private Instant effectiveTo;

    @Column(name = "policy_metadata", columnDefinition = "jsonb")
    private String policyMetadata;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
