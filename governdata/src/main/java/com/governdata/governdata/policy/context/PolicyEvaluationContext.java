package com.governdata.governdata.policy.context;

import com.governdata.governdata.api.dto.AuthorizationRequest;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class PolicyEvaluationContext {

    private UUID requestId;
    private String subjectUserId;
    private String subjectRole;
    private String subjectDepartment;
    private String resourceType;
    private String resourceId;
    private String action;

    private String purpose;
    private String location;
    private Instant timestamp;

    private String legalBasis;
    private Boolean consentGranted;
    private Boolean emergencyAccess;
    private String region;

    private String sourceSystem;
    private String tenantId;

    @Builder.Default
    private Map<String, Object> attributes = new HashMap<>();

    public static PolicyEvaluationContext fromAuthorizationRequest(AuthorizationRequest request) {
        Map<String, Object> attrs = new HashMap<>();
        String legalBasis = null;
        Boolean consentGranted = null;
        Boolean emergencyAccess = null;
        String region = null;
        String sourceSystem = null;
        String tenantId = null;

        if (request.getContext() != null && request.getContext().getAttributes() != null) {
            attrs.putAll(request.getContext().getAttributes());
            legalBasis = asString(attrs.get("legalBasis"));
            consentGranted = asBoolean(attrs.get("consentGranted"));
            emergencyAccess = asBoolean(attrs.get("emergencyAccess"));
            region = asString(attrs.get("region"));
            sourceSystem = asString(attrs.get("sourceSystem"));
            tenantId = asString(attrs.get("tenantId"));
        }

        return PolicyEvaluationContext.builder()
                .requestId(request.getRequestId())
                .subjectUserId(request.getSubject() != null ? request.getSubject().getUserId() : null)
                .subjectRole(request.getSubject() != null ? request.getSubject().getRole() : null)
                .subjectDepartment(request.getSubject() != null ? request.getSubject().getDepartment() : null)
                .resourceType(request.getResource() != null ? request.getResource().getType() : null)
                .resourceId(request.getResource() != null ? request.getResource().getResourceId() : null)
                .action(request.getAction())
                .purpose(request.getContext() != null ? request.getContext().getPurpose() : null)
                .location(request.getContext() != null ? request.getContext().getLocation() : null)
                .timestamp(request.getContext() != null ? request.getContext().getTimestamp() : null)
                .legalBasis(legalBasis)
                .consentGranted(consentGranted)
                .emergencyAccess(emergencyAccess)
                .region(region)
                .sourceSystem(sourceSystem)
                .tenantId(tenantId)
                .attributes(attrs)
                .build();
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("requestId", requestId != null ? requestId.toString() : null);
        map.put("subjectUserId", subjectUserId);
        map.put("subjectRole", subjectRole);
        map.put("subjectDepartment", subjectDepartment);
        map.put("resourceType", resourceType);
        map.put("resourceId", resourceId);
        map.put("action", action);
        map.put("purpose", purpose);
        map.put("location", location);
        map.put("timestamp", timestamp != null ? timestamp.toString() : null);
        map.put("legalBasis", legalBasis);
        map.put("consentGranted", consentGranted);
        map.put("emergencyAccess", emergencyAccess);
        map.put("region", region);
        map.put("sourceSystem", sourceSystem);
        map.put("tenantId", tenantId);
        map.put("attributes", attributes);
        return map;
    }

    private static String asString(Object value) {
        return value != null ? String.valueOf(value) : null;
    }

    private static Boolean asBoolean(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean b) {
            return b;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }
}
