package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "authorization_requests",
        uniqueConstraints = @UniqueConstraint(name = "uq_authorization_requests_request_tenant", columnNames = {"request_id", "tenant_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "subject_user_id", nullable = false, length = 255)
    private String subjectUserId;

    @Column(name = "subject_role", nullable = false, length = 64)
    private String subjectRole;

    @Column(name = "subject_department", length = 128)
    private String subjectDepartment;

    @Column(name = "resource_type", nullable = false, length = 64)
    private String resourceType;

    @Column(name = "resource_id", nullable = false, length = 255)
    private String resourceId;

    @Column(nullable = false, length = 32)
    private String action;

    @Column(name = "context_purpose", length = 64)
    private String contextPurpose;

    @Column(name = "context_location", length = 128)
    private String contextLocation;

    @Column(name = "context_timestamp")
    private Instant contextTimestamp;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();
}
