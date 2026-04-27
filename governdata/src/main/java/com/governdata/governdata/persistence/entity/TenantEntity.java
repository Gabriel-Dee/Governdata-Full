package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_key", nullable = false, unique = true, length = 64)
    private String tenantKey;

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    /** Customer org contact (e.g. hospital IT); optional. */
    @Column(name = "primary_contact_email", length = 255)
    private String primaryContactEmail;

    @Column(name = "primary_contact_name", length = 255)
    private String primaryContactName;

    @Column(name = "primary_contact_title", length = 128)
    private String primaryContactTitle;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
