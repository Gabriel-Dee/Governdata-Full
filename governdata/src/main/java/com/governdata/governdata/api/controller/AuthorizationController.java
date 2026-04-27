package com.governdata.governdata.api.controller;

import com.governdata.governdata.api.dto.AuditResponseDTO;
import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.api.dto.AuthorizationRequest;
import com.governdata.governdata.debug.RuntimeDebugLogger;
import com.governdata.governdata.service.AuditService;
import com.governdata.governdata.service.GovernanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthorizationController {

    private final GovernanceService governanceService;
    private final AuditService auditService;

    @PostMapping(value = "/authorize", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthorizationDecision> authorize(@Valid @RequestBody AuthorizationRequest request) {
        // #region agent log
        RuntimeDebugLogger.log("run-curl", "H2", "AuthorizationController:authorize:entry", "Incoming authorize request", Map.of(
                "requestId", String.valueOf(request.getRequestId()),
                "action", String.valueOf(request.getAction())
        ));
        // #endregion
        AuthorizationDecision decision = governanceService.authorize(request);
        // #region agent log
        RuntimeDebugLogger.log("run-curl", "H4", "AuthorizationController:authorize:exit", "Authorize response produced", Map.of(
                "decision", String.valueOf(decision.getDecision()),
                "runtime", String.valueOf(decision.getRuntimeUsed()),
                "reason", String.valueOf(decision.getReason())
        ));
        // #endregion
        return ResponseEntity.ok(decision);
    }

    @GetMapping(value = "/audit/{requestId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuditResponseDTO> getAudit(@PathVariable UUID requestId) {
        // #region agent log
        RuntimeDebugLogger.log("run-curl", "H3", "AuthorizationController:getAudit:entry", "Incoming audit lookup", Map.of(
                "requestId", String.valueOf(requestId)
        ));
        // #endregion
        return auditService.getAuditByRequestId(requestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
