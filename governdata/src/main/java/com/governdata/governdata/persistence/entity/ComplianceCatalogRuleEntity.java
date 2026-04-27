package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "compliance_catalog_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceCatalogRuleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 8)
    private String framework;

    @Column(name = "rule_code", nullable = false, length = 128)
    private String ruleCode;

    @Column(name = "legal_reference", length = 512)
    private String legalReference;

    @Column(nullable = false, length = 96)
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "requirement_type", length = 32)
    private String requirementType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "evidence_key", length = 128)
    private String evidenceKey;

    @Column(nullable = false)
    private boolean automated;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
