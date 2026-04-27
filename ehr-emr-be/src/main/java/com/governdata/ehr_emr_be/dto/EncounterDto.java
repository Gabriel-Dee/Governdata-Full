package com.governdata.ehr_emr_be.dto;

import com.governdata.ehr_emr_be.encounter.Encounter;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EncounterDto(
        UUID id,
        UUID patientId,
        OffsetDateTime encounterDate,
        String type,
        String reason,
        String providerId,
        String location,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static EncounterDto from(Encounter e) {
        return new EncounterDto(
                e.getId(),
                e.getPatient().getId(),
                e.getEncounterDate(),
                e.getType(),
                e.getReason(),
                e.getProviderId(),
                e.getLocation(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
