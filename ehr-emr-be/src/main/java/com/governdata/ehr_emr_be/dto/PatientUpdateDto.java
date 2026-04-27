package com.governdata.ehr_emr_be.dto;

import java.time.LocalDate;

public record PatientUpdateDto(
        String firstName,
        String lastName,
        LocalDate dob,
        Integer age,
        String gender,
        String address,
        String phone,
        String email
) {}
