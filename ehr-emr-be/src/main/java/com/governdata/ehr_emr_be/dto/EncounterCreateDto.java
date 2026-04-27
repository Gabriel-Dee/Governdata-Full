package com.governdata.ehr_emr_be.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record EncounterCreateDto(
        @NotNull(message = "Encounter date is required") OffsetDateTime encounterDate,
        @NotBlank(message = "Type is required") String type,
        String reason,
        String providerId,
        String location
) {}
