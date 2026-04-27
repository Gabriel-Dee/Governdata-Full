package com.governdata.ehr_emr_be.audit;

import com.governdata.ehr_emr_be.governance.AuditIngestRequest;
import com.governdata.ehr_emr_be.governance.AuthorizationResponse;
import com.governdata.ehr_emr_be.governance.GovernanceClient;
import com.governdata.ehr_emr_be.governance.GovernanceClientProperties;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class GovernanceAuditBridgeService {

    private final GovernanceClient governanceClient;
    private final GovernanceClientProperties properties;

    public GovernanceAuditBridgeService(GovernanceClient governanceClient, GovernanceClientProperties properties) {
        this.governanceClient = governanceClient;
        this.properties = properties;
    }

    public void ingestAllow(AuditEvent event, AuthorizationResponse authorization) {
        ingest(event, "ALLOW", authorization);
    }

    public void ingestDeny(AuditEvent event, AuthorizationResponse authorization) {
        ingest(event, "DENY", authorization);
    }

    private void ingest(AuditEvent event, String decision, AuthorizationResponse authorization) {
        if (!properties.isAuditIngestEnabled()) {
            return;
        }
        Map<String, Object> metadata = new HashMap<>();
        if (authorization != null) {
            metadata.put("evaluationTraceId", authorization.evaluationTraceId());
            metadata.put("policyVersion", authorization.policyVersion());
            metadata.put("runtimeUsed", authorization.runtimeUsed());
            metadata.put("reason", authorization.reason());
        }
        metadata.put("resourceType", event.getResourceType());
        metadata.put("patientId", event.getPatientId() != null ? event.getPatientId().toString() : null);
        metadata.put("beforeStateHash", event.getBeforeStateHash());
        metadata.put("afterStateHash", event.getAfterStateHash());

        String targetResource = event.getResourceType() + ":" + (event.getResourceId() != null ? event.getResourceId() : "global");
        governanceClient.ingestAudit(new AuditIngestRequest(
                properties.getSourceSystem(),
                event.getActorUserId().toString(),
                targetResource,
                event.getAction(),
                decision,
                event.getOccurredAt().toInstant(),
                event.getId().toString(),
                metadata
        ));
    }
}
