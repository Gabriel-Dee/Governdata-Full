package com.governdata.ehr_emr_be.dto;

import com.governdata.ehr_emr_be.medication.Medication;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MedicationDto(
        UUID id,
        UUID patientId,
        String drugName,
        String dose,
        String route,
        String frequency,
        LocalDate startDate,
        LocalDate endDate,
        String prescribingProviderId,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static MedicationDto from(Medication m) {
        return new MedicationDto(
                m.getId(),
                m.getPatient().getId(),
                m.getDrugName(),
                m.getDose(),
                m.getRoute(),
                m.getFrequency(),
                m.getStartDate(),
                m.getEndDate(),
                m.getPrescribingProviderId(),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }
}
