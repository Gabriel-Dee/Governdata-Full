package com.governdata.governdata.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditIngestResponse {

    private String correlationId;
    private String eventHash;
    private String evidenceId;
    private String chainNetwork;
    private Instant anchorTimestamp;
    private String verificationStatus;
}
