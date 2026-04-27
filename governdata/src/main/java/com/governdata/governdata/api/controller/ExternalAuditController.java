package com.governdata.governdata.api.controller;

import com.governdata.governdata.api.dto.AuditIngestRequest;
import com.governdata.governdata.api.dto.AuditIngestResponse;
import com.governdata.governdata.service.audit.AuditIngestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class ExternalAuditController {

    private final AuditIngestionService auditIngestionService;

    @PostMapping(value = "/ingest", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuditIngestResponse> ingest(@Valid @RequestBody AuditIngestRequest request) {
        return ResponseEntity.ok(auditIngestionService.ingest(request));
    }

    @GetMapping(value = "/verify/{correlationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuditIngestResponse> verify(@PathVariable String correlationId) {
        return ResponseEntity.ok(auditIngestionService.verify(correlationId));
    }
}
