package com.governdata.ehr_emr_be.governance;

import java.time.Instant;

public record AuditIngestResponse(
        String correlationId,
        String eventHash,
        String evidenceId,
        String chainNetwork,
        Instant anchorTimestamp,
        String verificationStatus
) {
}
