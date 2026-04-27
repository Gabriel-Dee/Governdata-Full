package com.governdata.ehr_emr_be.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.UUID;

public record DiagnosisCreateDto(
        @NotBlank(message = "Code is required") String code,
        String description,
        LocalDate onsetDate,
        LocalDate resolvedDate,
        UUID encounterId
) {}
