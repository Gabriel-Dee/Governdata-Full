package com.governdata.ehr_emr_be.governance;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class GovernanceAuthorizationFactory {

    private final GovernanceClientProperties properties;

    public GovernanceAuthorizationFactory(GovernanceClientProperties properties) {
        this.properties = properties;
    }

    public AuthorizationRequest build(UUID patientId, String resourceType, String action) {
        String region = valueOrDefault(GovernanceRequestContext.getRegion(), properties.getDefaultRegion());
        String legalBasis = valueOrDefault(GovernanceRequestContext.getLegalBasis(), inferLegalBasis(region));
        Boolean consentGranted = GovernanceRequestContext.getConsentGranted();
        if (consentGranted == null) {
            consentGranted = properties.isDefaultConsentGranted();
        }
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("legalBasis", legalBasis);
        attributes.put("consentGranted", consentGranted);
        attributes.put("region", region);
        attributes.put("sourceSystem", properties.getSourceSystem());
        attributes.put("tenantId", properties.getTenantKey());
        return AuthorizationRequest.of(
                GovernanceRequestContext.getRequiredUserId(),
                normalizeRole(valueOrDefault(GovernanceRequestContext.getRole(), "Doctor")),
                valueOrDefault(GovernanceRequestContext.getDepartment(), properties.getDefaultDepartment()),
                patientId,
                normalizeResourceType(resourceType),
                normalizeAction(action),
                GovernanceRequestContext.getPurposeOfUse(),
                valueOrDefault(GovernanceRequestContext.getLocation(), properties.getDefaultLocation()),
                attributes
        );
    }

    private String inferLegalBasis(String region) {
        if (region == null) {
            return properties.getDefaultLegalBasis();
        }
        if ("EU".equalsIgnoreCase(region) || "EEA".equalsIgnoreCase(region)) {
            return "GDPR_CONSENT";
        }
        return properties.getDefaultLegalBasis();
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "Doctor";
        }
        return switch (role.trim().toUpperCase()) {
            case "ADMIN" -> "Admin";
            case "CLINICIAN", "DOCTOR" -> "Doctor";
            case "NURSE" -> "Nurse";
            case "RESEARCHER" -> "Researcher";
            default -> role;
        };
    }

    private String normalizeResourceType(String ignoredResourceType) {
        // Governance policy packs are authored against PatientRecord for this integration profile.
        return "PatientRecord";
    }

    private String normalizeAction(String action) {
        if (action == null) {
            return "READ";
        }
        return switch (action.trim().toUpperCase()) {
            case "READ", "LIST" -> "READ";
            case "CREATE", "UPDATE", "WRITE" -> "WRITE";
            case "DELETE" -> "DELETE";
            default -> action.trim().toUpperCase();
        };
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
