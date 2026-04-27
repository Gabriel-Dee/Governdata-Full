package com.governdata.ehr_emr_be.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldErrorDto> fieldErrors
) {
    public record FieldErrorDto(String field, String message) {}

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(
                OffsetDateTime.now(),
                status,
                error,
                message,
                path,
                null
        );
    }

    public static ErrorResponse of(int status, String error, String message, String path, List<FieldErrorDto> fieldErrors) {
        return new ErrorResponse(
                OffsetDateTime.now(),
                status,
                error,
                message,
                path,
                fieldErrors
        );
    }
}
