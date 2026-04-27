package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(
        name = "external_audit_events",
        uniqueConstraints = @UniqueConstraint(name = "uq_external_audit_events_corr_tenant", columnNames = {"correlation_id", "tenant_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalAuditEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "correlation_id", nullable = false, length = 128)
    private String correlationId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "source_system", nullable = false, length = 128)
    private String sourceSystem;

    @Column(nullable = false, length = 255)
    private String actor;

    @Column(name = "target_resource", nullable = false, length = 255)
    private String targetResource;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(nullable = false, length = 16)
    private String decision;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "event_hash", nullable = false, length = 64)
    private String eventHash;

    @Column(name = "evidence_id", length = 255)
    private String evidenceId;

    @Column(name = "chain_network", length = 64)
    private String chainNetwork;

    @Column(name = "anchor_timestamp")
    private Instant anchorTimestamp;

    @Column(name = "verification_status", nullable = false, length = 32)
    private String verificationStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private Map<String, Object> metadataJson;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
