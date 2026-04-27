package com.governdata.governdata.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditIngestRequest {

    @NotBlank
    private String sourceSystem;

    @NotBlank
    private String actor;

    @NotBlank
    private String targetResource;

    @NotBlank
    private String action;

    @NotBlank
    private String decision;

    @NotNull
    private Instant timestamp;

    @NotBlank
    private String correlationId;

    /** Flexible payload for heterogeneous systems. */
    private Map<String, Object> metadata;
}
