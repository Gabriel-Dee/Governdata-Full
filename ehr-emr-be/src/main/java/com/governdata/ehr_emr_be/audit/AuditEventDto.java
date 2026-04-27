package com.governdata.ehr_emr_be.audit;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AuditEventDto(
        UUID id,
        OffsetDateTime occurredAt,
        UUID actorUserId,
        String action,
        String resourceType,
        UUID resourceId,
        UUID patientId,
        String beforeStateHash,
        String afterStateHash
) {
    public static AuditEventDto from(AuditEvent e) {
        return new AuditEventDto(
                e.getId(),
                e.getOccurredAt(),
                e.getActorUserId(),
                e.getAction(),
                e.getResourceType(),
                e.getResourceId(),
                e.getPatientId(),
                e.getBeforeStateHash(),
                e.getAfterStateHash()
        );
    }
}
