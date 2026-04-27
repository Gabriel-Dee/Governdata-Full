package com.governdata.governdata.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<FieldViolation> violations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldViolation {
        private String field;
        private String message;
        private Object rejectedValue;
    }
}
