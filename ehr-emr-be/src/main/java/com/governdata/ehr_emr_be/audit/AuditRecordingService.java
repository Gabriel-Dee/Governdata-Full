package com.governdata.ehr_emr_be.audit;

import com.governdata.ehr_emr_be.governance.GovernanceRequestContext;
import com.governdata.ehr_emr_be.governance.AuthorizationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditRecordingService {

    private final AuditEventRepository auditEventRepository;
    private final GovernanceAuditBridgeService governanceAuditBridgeService;

    public AuditRecordingService(AuditEventRepository auditEventRepository, GovernanceAuditBridgeService governanceAuditBridgeService) {
        this.auditEventRepository = auditEventRepository;
        this.governanceAuditBridgeService = governanceAuditBridgeService;
    }

    @Transactional
    public AuditEvent record(String action, String resourceType, UUID resourceId, UUID patientId,
                       String beforeStateHash, String afterStateHash) {
        UUID actor = GovernanceRequestContext.getRequiredUserId();
        AuditEvent event = append(actor, action, resourceType, resourceId, patientId, beforeStateHash, afterStateHash);
        governanceAuditBridgeService.ingestAllow(event, GovernanceRequestContext.getLastAuthorization().orElse(null));
        return event;
    }

    /**
     * For events before an authenticated session exists (e.g. successful login).
     */
    @Transactional
    public AuditEvent recordForActor(UUID actorUserId, String action, String resourceType, UUID resourceId, UUID patientId,
                               String beforeStateHash, String afterStateHash) {
        AuditEvent event = append(actorUserId, action, resourceType, resourceId, patientId, beforeStateHash, afterStateHash);
        governanceAuditBridgeService.ingestAllow(event, GovernanceRequestContext.getLastAuthorization().orElse(null));
        return event;
    }

    @Transactional
    public AuditEvent recordDeniedForActor(UUID actorUserId, String action, String resourceType, UUID resourceId, UUID patientId,
                                           String beforeStateHash, String afterStateHash, AuthorizationResponse authorizationResponse) {
        AuditEvent event = append(actorUserId, action, resourceType, resourceId, patientId, beforeStateHash, afterStateHash);
        governanceAuditBridgeService.ingestDeny(event, authorizationResponse);
        return event;
    }

    private AuditEvent append(UUID actorUserId, String action, String resourceType, UUID resourceId, UUID patientId,
                        String beforeStateHash, String afterStateHash) {
        AuditEvent row = new AuditEvent();
        row.setActorUserId(actorUserId);
        row.setAction(action);
        row.setResourceType(resourceType);
        row.setResourceId(resourceId);
        row.setPatientId(patientId);
        row.setBeforeStateHash(beforeStateHash);
        row.setAfterStateHash(afterStateHash);
        return auditEventRepository.save(row);
    }
}
