package com.governdata.ehr_emr_be.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record MedicationCreateDto(
        @NotBlank(message = "Drug name is required") String drugName,
        String dose,
        String route,
        String frequency,
        LocalDate startDate,
        LocalDate endDate,
        String prescribingProviderId
) {}
