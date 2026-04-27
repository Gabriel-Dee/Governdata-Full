package com.governdata.ehr_emr_be.dto;

import com.governdata.ehr_emr_be.patient.Patient;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Patient projection for APIs. CSV-backed rows use {@code id} (Patient_ID) and {@code age}/{@code gender};
 * name, DOB, contacts may be null when loaded from {@code Healthcare data.csv} only.
 */
public record PatientDto(
        UUID id,
        String mrn,
        String firstName,
        String lastName,
        LocalDate dob,
        Integer age,
        String gender,
        String address,
        String phone,
        String email,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static PatientDto from(Patient p) {
        return new PatientDto(
                p.getId(),
                p.getMrn(),
                p.getFirstName(),
                p.getLastName(),
                p.getDob(),
                p.getAge(),
                p.getGender(),
                p.getAddress(),
                p.getPhone(),
                p.getEmail(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
