package com.governdata.ehr_emr_be.dto;

import com.governdata.ehr_emr_be.diagnosis.Diagnosis;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record DiagnosisDto(
        UUID id,
        UUID patientId,
        UUID encounterId,
        String code,
        String description,
        LocalDate onsetDate,
        LocalDate resolvedDate,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static DiagnosisDto from(Diagnosis d) {
        return new DiagnosisDto(
                d.getId(),
                d.getPatient().getId(),
                d.getEncounter() != null ? d.getEncounter().getId() : null,
                d.getCode(),
                d.getDescription(),
                d.getOnsetDate(),
                d.getResolvedDate(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
