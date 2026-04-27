package com.governdata.governdata.policy.runtime.json;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.policy.context.PolicyEvaluationContext;
import com.governdata.governdata.policy.runtime.PolicyRuntime;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class JsonPolicyRuntime implements PolicyRuntime {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public String mode() {
        return "JSON";
    }

    @Override
    public AuthorizationDecision evaluate(
            PolicyEvaluationContext context,
            String policyContent,
            Long policyVersionId,
            String policyVersionHash
    ) {
        String traceId = UUID.randomUUID().toString();
        try {
            JsonNode root = OBJECT_MAPPER.readTree(policyContent);
            JsonNode rules = root.path("rules");
            if (!rules.isArray() || rules.isEmpty()) {
                return deny("Policy has no rules array", policyVersionId, policyVersionHash, traceId);
            }

            List<JsonNode> sortedRules = new ArrayList<>();
            rules.forEach(sortedRules::add);
            sortedRules.sort(Comparator.comparingInt(this::priority).reversed());

            String defaultEffect = root.path("defaultEffect").asText("DENY");
            for (JsonNode rule : sortedRules) {
                if (matches(rule, context)) {
                    boolean allow = "ALLOW".equalsIgnoreCase(rule.path("effect").asText("DENY"));
                    return AuthorizationDecision.builder()
                            .decision(allow ? AuthorizationDecision.Decision.ALLOW : AuthorizationDecision.Decision.DENY)
                            .policyVersion(policyVersionHash)
                            .policyVersionId(policyVersionId)
                            .reason(rule.path("reason").asText("Matched policy rule"))
                            .runtimeUsed(mode())
                            .evaluationTraceId(traceId)
                            .build();
                }
            }

            if ("ALLOW".equalsIgnoreCase(defaultEffect)) {
                return AuthorizationDecision.builder()
                        .decision(AuthorizationDecision.Decision.ALLOW)
                        .policyVersion(policyVersionHash)
                        .policyVersionId(policyVersionId)
                        .reason("No rule matched; default effect ALLOW")
                        .runtimeUsed(mode())
                        .evaluationTraceId(traceId)
                        .build();
            }
            return deny("No policy rule matched", policyVersionId, policyVersionHash, traceId);
        } catch (Exception e) {
            return deny("Policy parse/evaluation error: " + e.getMessage(), policyVersionId, policyVersionHash, traceId);
        }
    }

    private int priority(JsonNode rule) {
        return rule.has("priority") ? rule.path("priority").asInt(0) : 0;
    }

    private boolean matches(JsonNode rule, PolicyEvaluationContext context) {
        if (rule.has("role") && !eq(rule.path("role").asText(), context.getSubjectRole())) return false;
        if (rule.has("department") && !eq(rule.path("department").asText(), context.getSubjectDepartment())) return false;
        if (rule.has("resourceType") && !eq(rule.path("resourceType").asText(), context.getResourceType())) return false;
        if (rule.has("action") && !eq(rule.path("action").asText(), context.getAction())) return false;
        if (rule.has("purpose") && !eq(rule.path("purpose").asText(), context.getPurpose())) return false;
        if (rule.has("legalBasis") && !eq(rule.path("legalBasis").asText(), context.getLegalBasis())) return false;
        if (rule.has("region") && !eq(rule.path("region").asText(), context.getRegion())) return false;

        if (rule.has("consentRequired") && rule.path("consentRequired").asBoolean(false)) {
            if (!Boolean.TRUE.equals(context.getConsentGranted())) return false;
        }
        if (rule.has("emergencyOnly") && rule.path("emergencyOnly").asBoolean(false)) {
            if (!Boolean.TRUE.equals(context.getEmergencyAccess())) return false;
        }

        JsonNode conditions = rule.path("conditions");
        if (conditions.isObject()) {
            for (Map.Entry<String, JsonNode> entry : iterable(conditions.fields())) {
                Object actual = context.getAttributes().get(entry.getKey());
                String expected = entry.getValue().isTextual() ? entry.getValue().asText() : entry.getValue().toString();
                if (actual == null || !expected.equals(String.valueOf(actual))) {
                    return false;
                }
            }
        }

        JsonNode effectiveFrom = rule.get("effectiveFrom");
        JsonNode effectiveTo = rule.get("effectiveTo");
        Instant now = context.getTimestamp() != null ? context.getTimestamp() : Instant.now();
        if (effectiveFrom != null && effectiveFrom.isTextual()) {
            Instant from = Instant.parse(effectiveFrom.asText());
            if (now.isBefore(from)) return false;
        }
        if (effectiveTo != null && effectiveTo.isTextual()) {
            Instant to = Instant.parse(effectiveTo.asText());
            if (now.isAfter(to)) return false;
        }
        return true;
    }

    private static boolean eq(String expected, String actual) {
        return expected != null && actual != null && expected.equals(actual);
    }

    private static AuthorizationDecision deny(String reason, Long policyVersionId, String policyVersionHash, String traceId) {
        return AuthorizationDecision.builder()
                .decision(AuthorizationDecision.Decision.DENY)
                .policyVersion(policyVersionHash)
                .policyVersionId(policyVersionId)
                .reason(reason)
                .runtimeUsed("JSON")
                .evaluationTraceId(traceId)
                .build();
    }

    private static <T> Iterable<T> iterable(java.util.Iterator<T> iterator) {
        return () -> iterator;
    }
}
