package com.governdata.governdata.service;

import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.api.dto.AuthorizationRequest;
import com.governdata.governdata.config.AuditStorage;
import com.governdata.governdata.debug.RuntimeDebugLogger;
import com.governdata.governdata.engines.GovernanceEngine;
import com.governdata.governdata.engines.blockchain.FabricGatewayService;
import com.governdata.governdata.persistence.entity.AuthorizationRequestEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GovernanceService {

    private final EngineSelector engineSelector;
    private final AuditService auditService;
    private final FabricGatewayService fabricGatewayService;

    @Value("${governance.audit.storage:DB_ONLY}")
    private AuditStorage auditStorage;

    @Transactional
    public AuthorizationDecision authorize(AuthorizationRequest request) {
        AuthorizationRequestEntity requestEntity = auditService.persistRequest(request);
        GovernanceEngine engine = engineSelector.selectEngine();

        // #region agent log
        RuntimeDebugLogger.log("run-curl", "H1", "GovernanceService:authorize:engine", "Selected governance engine", Map.of(
                "engineType", String.valueOf(engine.getEngineType()),
                "auditStorage", String.valueOf(auditStorage)
        ));
        // #endregion

        long start = System.currentTimeMillis();
        AuthorizationDecision decision = engine.evaluate(request);
        int latencyMs = (int) (System.currentTimeMillis() - start);
        Instant timestamp = Instant.now();

        String evidenceId = null;
        if (auditStorage == AuditStorage.BOTH || auditStorage == AuditStorage.BLOCKCHAIN_ONLY) {
            try {
                evidenceId = fabricGatewayService.submitRecordDecision(
                        request.getRequestId().toString(),
                        decision.getDecision().name(),
                        decision.getPolicyVersion() != null ? decision.getPolicyVersion() : "",
                        timestamp,
                        request.getSubject() != null ? request.getSubject().getUserId() : ""
                );
            } catch (Exception e) {
                // #region agent log
                RuntimeDebugLogger.log("run-curl", "H5", "GovernanceService:authorize:blockchainError", "Blockchain evidence write failed", Map.of(
                        "requestId", String.valueOf(request.getRequestId()),
                        "error", String.valueOf(e.getMessage())
                ));
                // #endregion
                log.error("Failed to record decision on blockchain for requestId={}", request.getRequestId(), e);
                throw new RuntimeException("Blockchain audit record failed: " + e.getMessage(), e);
            }
        }

        if (auditStorage == AuditStorage.DB_ONLY || auditStorage == AuditStorage.BOTH) {
            auditService.persistDecision(
                    requestEntity,
                    decision,
                    latencyMs,
                    decision.getPolicyVersionId(),
                    decision.getPolicyVersion(),
                    evidenceId
            );
        }

        if (evidenceId != null) {
            decision.setEvidenceId(evidenceId);
        }

        // #region agent log
        RuntimeDebugLogger.log("run-curl", "H4", "GovernanceService:authorize:decision", "Final authorization decision", Map.of(
                "decision", String.valueOf(decision.getDecision()),
                "runtimeUsed", String.valueOf(decision.getRuntimeUsed()),
                "latencyMs", latencyMs,
                "evidenceIdPresent", evidenceId != null
        ));
        // #endregion
        return decision;
    }
}
