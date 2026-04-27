package com.governdata.ehr_emr_be.audit;

import com.governdata.ehr_emr_be.governance.AuditIngestResponse;
import com.governdata.ehr_emr_be.governance.GovernanceClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AuditEventController {

    private final AuditEventQueryService auditEventQueryService;
    private final GovernanceClient governanceClient;

    public AuditEventController(AuditEventQueryService auditEventQueryService, GovernanceClient governanceClient) {
        this.auditEventQueryService = auditEventQueryService;
        this.governanceClient = governanceClient;
    }

    @GetMapping("/audit-events")
    @PreAuthorize("hasAuthority('SCOPE_audit.read')")
    public ResponseEntity<Page<AuditEventDto>> list(
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) UUID actorUserId,
            @PageableDefault(size = 50, sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(auditEventQueryService.search(resourceType, actorUserId, pageable));
    }

    @GetMapping("/audit-events/{auditEventId}/verify")
    @PreAuthorize("hasAuthority('SCOPE_audit.read')")
    public ResponseEntity<AuditIngestResponse> verify(@org.springframework.web.bind.annotation.PathVariable UUID auditEventId) {
        return ResponseEntity.ok(governanceClient.verifyAudit(auditEventId.toString()));
    }
}
