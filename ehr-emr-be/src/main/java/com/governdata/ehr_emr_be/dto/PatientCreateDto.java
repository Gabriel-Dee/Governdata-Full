package com.governdata.ehr_emr_be.dto;

import java.time.LocalDate;

/**
 * Optional demographics for manual create. Omitted fields stay null; {@code mrn} defaults to new {@code id} string on save.
 */
public record PatientCreateDto(
        String mrn,
        String firstName,
        String lastName,
        LocalDate dob,
        Integer age,
        String gender,
        String address,
        String phone,
        String email
) {}
