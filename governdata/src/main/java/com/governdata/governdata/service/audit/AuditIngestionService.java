package com.governdata.governdata.service.audit;

import com.governdata.governdata.api.dto.AuditIngestRequest;
import com.governdata.governdata.api.dto.AuditIngestResponse;
import com.governdata.governdata.auth.TenantRequestContext;
import com.governdata.governdata.config.AuditStorage;
import com.governdata.governdata.debug.RuntimeDebugLogger;
import com.governdata.governdata.engines.blockchain.FabricGatewayService;
import com.governdata.governdata.persistence.entity.ExternalAuditEventEntity;
import com.governdata.governdata.persistence.repository.ExternalAuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuditIngestionService {

    private final ExternalAuditEventRepository externalAuditEventRepository;
    private final FabricGatewayService fabricGatewayService;

    @Value("${governance.audit.storage:DB_ONLY}")
    private AuditStorage auditStorage;

    @Value("${governance.blockchain.network:hyperledger-fabric}")
    private String blockchainNetwork;

    @Transactional
    public AuditIngestResponse ingest(AuditIngestRequest request) {
        Long tenantId = TenantRequestContext.requireTenantId();
        // #region agent log
        RuntimeDebugLogger.log("run-curl", "H3", "AuditIngestionService:ingest:entry", "External audit ingestion request", Map.of(
                "correlationId", String.valueOf(request.getCorrelationId()),
                "sourceSystem", String.valueOf(request.getSourceSystem()),
                "auditStorage", String.valueOf(auditStorage)
        ));
        // #endregion

        String eventHash = hashCanonical(request);
        String evidenceId = null;
        Instant anchorTimestamp = null;

        if (auditStorage == AuditStorage.BLOCKCHAIN_ONLY || auditStorage == AuditStorage.BOTH) {
            try {
                evidenceId = fabricGatewayService.submitRecordDecision(
                        request.getCorrelationId(),
                        request.getDecision(),
                        eventHash,
                        request.getTimestamp(),
                        request.getActor()
                );
                anchorTimestamp = Instant.now();
            } catch (Exception e) {
                throw new RuntimeException("Failed to anchor audit event on blockchain: " + e.getMessage(), e);
            }
        }

        // Persist metadata for verify/lookup in all modes (BLOCKCHAIN_ONLY included; no raw PHI).
        ExternalAuditEventEntity entity = ExternalAuditEventEntity.builder()
                .correlationId(request.getCorrelationId())
                .tenantId(tenantId)
                .sourceSystem(request.getSourceSystem())
                .actor(request.getActor())
                .targetResource(request.getTargetResource())
                .action(request.getAction())
                .decision(request.getDecision())
                .occurredAt(request.getTimestamp())
                .eventHash(eventHash)
                .evidenceId(evidenceId)
                .chainNetwork(evidenceId != null ? blockchainNetwork : null)
                .anchorTimestamp(anchorTimestamp)
                .verificationStatus(evidenceId != null ? "ANCHORED" : "DB_ONLY")
                .metadataJson(request.getMetadata())
                .build();
        externalAuditEventRepository.save(entity);

        return AuditIngestResponse.builder()
                .correlationId(request.getCorrelationId())
                .eventHash(eventHash)
                .evidenceId(evidenceId)
                .chainNetwork(evidenceId != null ? blockchainNetwork : null)
                .anchorTimestamp(anchorTimestamp)
                .verificationStatus(evidenceId != null ? "ANCHORED" : "DB_ONLY")
                .build();
    }

    @Transactional(readOnly = true)
    public AuditIngestResponse verify(String correlationId) {
        Long tenantId = TenantRequestContext.requireTenantId();
        Optional<ExternalAuditEventEntity> evtOpt = externalAuditEventRepository.findByCorrelationIdAndTenantId(correlationId, tenantId);
        if (evtOpt.isEmpty()) {
            // For real Fabric mode, recover verification directly from chain when DB row is missing.
            if (!fabricGatewayService.isStub()) {
                Optional<FabricGatewayService.ChainDecisionRecord> chain = fabricGatewayService.getDecision(correlationId);
                if (chain.isPresent()) {
                    return AuditIngestResponse.builder()
                            .correlationId(correlationId)
                            .eventHash(chain.get().getPolicyHash())
                            .verificationStatus("VERIFIED_CHAIN_ONLY")
                            .build();
                }
            }
            return AuditIngestResponse.builder()
                    .correlationId(correlationId)
                    .verificationStatus("NOT_FOUND")
                    .build();
        }
        ExternalAuditEventEntity evt = evtOpt.get();
        boolean verified = true;
        String expectedHash = hashCanonical(
                evt.getCorrelationId(),
                evt.getSourceSystem(),
                evt.getActor(),
                evt.getTargetResource(),
                evt.getAction(),
                evt.getDecision(),
                evt.getOccurredAt()
        );
        if (!expectedHash.equalsIgnoreCase(evt.getEventHash())) {
            verified = false;
        }
        if (evt.getEvidenceId() != null) {
            if (fabricGatewayService.isStub()) {
                // Local dev without Fabric: synthetic anchors verify against stored row only.
                verified = verified && evt.getEvidenceId().startsWith("stub-tx-");
            } else {
                verified = verified && fabricGatewayService.getDecision(correlationId)
                        .map(chain -> evt.getDecision().equalsIgnoreCase(chain.getDecision())
                                && evt.getEventHash().equalsIgnoreCase(chain.getPolicyHash()))
                        .orElse(false);
            }
        }
        return AuditIngestResponse.builder()
                .correlationId(evt.getCorrelationId())
                .eventHash(evt.getEventHash())
                .evidenceId(evt.getEvidenceId())
                .chainNetwork(evt.getChainNetwork())
                .anchorTimestamp(evt.getAnchorTimestamp())
                .verificationStatus(verified ? "VERIFIED" : "MISMATCH")
                .build();
    }

    private static String hashCanonical(AuditIngestRequest request) {
        return hashCanonical(
                request.getCorrelationId(),
                request.getSourceSystem(),
                request.getActor(),
                request.getTargetResource(),
                request.getAction(),
                request.getDecision(),
                request.getTimestamp()
        );
    }

    private static String hashCanonical(
            String correlationId,
            String sourceSystem,
            String actor,
            String targetResource,
            String action,
            String decision,
            Instant timestamp
    ) {
        try {
            String canonical = correlationId + "|" + sourceSystem + "|" + actor
                    + "|" + targetResource + "|" + action + "|" + decision
                    + "|" + timestamp;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(canonical.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new RuntimeException("Unable to hash canonical audit event", e);
        }
    }
}
