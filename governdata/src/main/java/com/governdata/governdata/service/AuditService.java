package com.governdata.governdata.service;

import com.governdata.governdata.api.dto.*;
import com.governdata.governdata.auth.TenantRequestContext;
import com.governdata.governdata.config.AuditStorage;
import com.governdata.governdata.engines.blockchain.FabricGatewayService;
import com.governdata.governdata.persistence.entity.AuditRecordEntity;
import com.governdata.governdata.persistence.entity.AuthorizationRequestEntity;
import com.governdata.governdata.persistence.entity.DecisionEntity;
import com.governdata.governdata.persistence.entity.PolicyVersionEntity;
import com.governdata.governdata.persistence.repository.AuditRecordRepository;
import com.governdata.governdata.persistence.repository.AuthorizationRequestRepository;
import com.governdata.governdata.persistence.repository.DecisionRepository;
import com.governdata.governdata.persistence.repository.PolicyVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuthorizationRequestRepository authorizationRequestRepository;
    private final DecisionRepository decisionRepository;
    private final AuditRecordRepository auditRecordRepository;
    private final PolicyVersionRepository policyVersionRepository;
    private final FabricGatewayService fabricGatewayService;

    @Value("${governance.audit.storage:DB_ONLY}")
    private AuditStorage auditStorage;

    @Transactional
    public AuthorizationRequestEntity persistRequest(AuthorizationRequest request) {
        Long tenantId = TenantRequestContext.requireTenantId();
        AuthorizationRequestEntity entity = toRequestEntity(request);
        entity.setTenantId(tenantId);
        return authorizationRequestRepository.save(entity);
    }

    @Transactional
    public DecisionEntity persistDecision(
            AuthorizationRequestEntity requestEntity,
            AuthorizationDecision decision,
            Integer latencyMs,
            Long policyVersionId,
            String policyVersionHash,
            String evidenceId
    ) {
        PolicyVersionEntity policyVersionRef = policyVersionId != null
                ? policyVersionRepository.getReferenceById(policyVersionId)
                : null;
        DecisionEntity decisionEntity = DecisionEntity.builder()
                .authorizationRequest(requestEntity)
                .engineType(decision.getEngine())
                .decision(decision.getDecision().name())
                .reasonText(decision.getReason())
                .evidenceId(evidenceId != null ? evidenceId : decision.getEvidenceId())
                .latencyMs(latencyMs)
                .policyVersion(policyVersionRef)
                .build();
        decisionEntity = decisionRepository.save(decisionEntity);

        AuditRecordEntity audit = AuditRecordEntity.builder()
                .requestId(requestEntity.getRequestId())
                .authorizationRequest(requestEntity)
                .decisionRef(decisionEntity)
                .engineUsed(decision.getEngine())
                .policyVersionHash(policyVersionHash != null ? policyVersionHash : null)
                .decisionOutcome(decision.getDecision().name())
                .build();
        auditRecordRepository.save(audit);

        return decisionEntity;
    }

    @Transactional(readOnly = true)
    public Optional<AuditResponseDTO> getAuditByRequestId(UUID requestId) {
        Long tenantId = TenantRequestContext.requireTenantId();
        Optional<AuditResponseDTO> fromDb = auditRecordRepository.findByRequestId(requestId, tenantId)
                .map(this::toAuditResponse);
        if (fromDb.isPresent()) {
            return fromDb;
        }
        if (auditStorage == AuditStorage.BLOCKCHAIN_ONLY) {
            return authorizationRequestRepository.findByRequestIdAndTenantId(requestId, tenantId)
                    .flatMap(req -> fabricGatewayService.getDecision(requestId.toString())
                            .map(chain -> toAuditResponseFromChain(req, chain)));
        }
        return Optional.empty();
    }

    private AuditResponseDTO toAuditResponseFromChain(AuthorizationRequestEntity req, FabricGatewayService.ChainDecisionRecord chain) {
        SubjectDTO subject = SubjectDTO.builder()
                .userId(req.getSubjectUserId())
                .role(req.getSubjectRole())
                .department(req.getSubjectDepartment())
                .build();
        ResourceDTO resource = ResourceDTO.builder()
                .type(req.getResourceType())
                .resourceId(req.getResourceId())
                .build();
        ContextDTO context = req.getContextPurpose() != null || req.getContextLocation() != null || req.getContextTimestamp() != null
                ? ContextDTO.builder()
                    .purpose(req.getContextPurpose())
                    .location(req.getContextLocation())
                    .timestamp(req.getContextTimestamp())
                    .build()
                : null;
        Instant decisionAt = null;
        if (chain.getTimestamp() != null && !chain.getTimestamp().isBlank()) {
            try {
                decisionAt = Instant.parse(chain.getTimestamp());
            } catch (DateTimeParseException ignored) {
            }
        }
        return AuditResponseDTO.builder()
                .requestId(req.getRequestId())
                .subject(subject)
                .resource(resource)
                .action(req.getAction())
                .context(context)
                .receivedAt(req.getReceivedAt())
                .decision(chain.getDecision())
                .engineUsed(null)
                .policyVersionHash(chain.getPolicyHash())
                .reason(null)
                .evidenceId(null)
                .latencyMs(null)
                .decisionAt(decisionAt)
                .eventHash(chain.getPolicyHash())
                .chainNetwork("hyperledger-fabric")
                .anchorTimestamp(decisionAt)
                .verificationStatus("CHAIN_ONLY")
                .build();
    }

    private AuthorizationRequestEntity toRequestEntity(AuthorizationRequest req) {
        return AuthorizationRequestEntity.builder()
                .requestId(req.getRequestId())
                .subjectUserId(req.getSubject().getUserId())
                .subjectRole(req.getSubject().getRole())
                .subjectDepartment(req.getSubject().getDepartment())
                .resourceType(req.getResource().getType())
                .resourceId(req.getResource().getResourceId())
                .action(req.getAction())
                .contextPurpose(req.getContext() != null ? req.getContext().getPurpose() : null)
                .contextLocation(req.getContext() != null ? req.getContext().getLocation() : null)
                .contextTimestamp(req.getContext() != null ? req.getContext().getTimestamp() : null)
                .receivedAt(Instant.now())
                .build();
    }

    private AuditResponseDTO toAuditResponse(AuditRecordEntity ar) {
        AuthorizationRequestEntity req = ar.getAuthorizationRequest();
        DecisionEntity dec = ar.getDecisionRef();
        SubjectDTO subject = SubjectDTO.builder()
                .userId(req.getSubjectUserId())
                .role(req.getSubjectRole())
                .department(req.getSubjectDepartment())
                .build();
        ResourceDTO resource = ResourceDTO.builder()
                .type(req.getResourceType())
                .resourceId(req.getResourceId())
                .build();
        ContextDTO context = req.getContextPurpose() != null || req.getContextLocation() != null || req.getContextTimestamp() != null
                ? ContextDTO.builder()
                    .purpose(req.getContextPurpose())
                    .location(req.getContextLocation())
                    .timestamp(req.getContextTimestamp())
                    .build()
                : null;
        return AuditResponseDTO.builder()
                .requestId(req.getRequestId())
                .subject(subject)
                .resource(resource)
                .action(req.getAction())
                .context(context)
                .receivedAt(req.getReceivedAt())
                .decision(ar.getDecisionOutcome())
                .engineUsed(ar.getEngineUsed())
                .policyVersionHash(ar.getPolicyVersionHash())
                .reason(dec.getReasonText())
                .evidenceId(dec.getEvidenceId())
                .latencyMs(dec.getLatencyMs())
                .decisionAt(dec.getCreatedAt())
                .eventHash(ar.getPolicyVersionHash())
                .chainNetwork(dec.getEvidenceId() != null ? "hyperledger-fabric" : null)
                .anchorTimestamp(dec.getEvidenceId() != null ? dec.getCreatedAt() : null)
                .verificationStatus(dec.getEvidenceId() != null ? "ANCHORED" : "DB_ONLY")
                .build();
    }
}
