package com.governdata.ehr_emr_be.governance;

import java.time.Instant;
import java.util.Map;

public record AuditIngestRequest(
        String sourceSystem,
        String actor,
        String targetResource,
        String action,
        String decision,
        Instant timestamp,
        String correlationId,
        Map<String, Object> metadata
) {
}
