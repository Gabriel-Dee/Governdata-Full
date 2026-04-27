package com.governdata.ehr_emr_be.governance;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

public record AuthorizationRequest(
        UUID requestId,
        Subject subject,
        Resource resource,
        String action,
        Context context
) {
    private static final DateTimeFormatter GOVERNANCE_TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneOffset.UTC);

    public static AuthorizationRequest of(
            UUID userId,
            String role,
            String department,
            UUID patientId,
            String resourceType,
            String action,
            String purposeOfUse,
            String location,
            Map<String, Object> attributes
    ) {
        String normalizedPurpose = purposeOfUse == null || purposeOfUse.isBlank() ? "TREATMENT" : purposeOfUse;
        String normalizedRole = role == null || role.isBlank() ? "Unknown" : role;
        String normalizedDepartment = department == null ? "" : department;
        String normalizedResourceType = resourceType == null || resourceType.isBlank() ? "Unknown" : resourceType;
        String normalizedResourceId = patientId != null ? patientId.toString() : "global";
        return new AuthorizationRequest(
                UUID.randomUUID(),
                new Subject(userId != null ? userId.toString() : "unknown-user", normalizedRole, normalizedDepartment),
                new Resource(normalizedResourceType, normalizedResourceId),
                action,
                new Context(normalizedPurpose, location, GOVERNANCE_TIMESTAMP.format(Instant.now()), attributes)
        );
    }

    public record Subject(String userId, String role, String department) {}

    public record Resource(String type, String resourceId) {}

    public record Context(String purpose, String location, String timestamp, Map<String, Object> attributes) {}
}
