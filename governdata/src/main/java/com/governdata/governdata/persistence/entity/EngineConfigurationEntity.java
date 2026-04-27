package com.governdata.governdata.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "engine_configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EngineConfigurationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "engine_type", nullable = false, unique = true, length = 32)
    private String engineType;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "config_json", columnDefinition = "jsonb")
    private String configJson;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
