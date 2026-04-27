package com.governdata.governdata.policy.runtime.opa;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.policy.context.PolicyEvaluationContext;
import com.governdata.governdata.policy.runtime.json.JsonPolicyRuntime;
import com.governdata.governdata.policy.runtime.PolicyRuntime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class OpaPolicyRuntime implements PolicyRuntime {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Value("${governance.policy.opa.url:http://localhost:8181/v1/data/healthcare/authz}")
    private String opaUrl;

    @Value("${governance.policy.opa.fail-open:false}")
    private boolean failOpen;

    @Value("${governance.policy.opa.fallback-json-on-error:false}")
    private boolean fallbackJsonOnError;

    private final RestTemplate restTemplate = new RestTemplate();
    private final JsonPolicyRuntime jsonPolicyRuntime;

    public OpaPolicyRuntime(JsonPolicyRuntime jsonPolicyRuntime) {
        this.jsonPolicyRuntime = jsonPolicyRuntime;
    }

    @Override
    public String mode() {
        return "OPA";
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
            Map<String, Object> input = new HashMap<>();
            input.put("context", context.toMap());
            input.put("policyVersionId", policyVersionId);
            input.put("policyVersionHash", policyVersionHash);
            input.put("policyContent", policyContent);

            Map<String, Object> payload = Map.of("input", input);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(opaUrl, request, String.class);

            JsonNode root = OBJECT_MAPPER.readTree(response.getBody());
            JsonNode result = root.path("result");

            boolean allow;
            String reason = "OPA decision";
            if (result.isBoolean()) {
                allow = result.asBoolean(false);
            } else {
                allow = result.path("allow").asBoolean(false);
                if (result.has("reason")) {
                    reason = result.path("reason").asText(reason);
                }
            }

            return AuthorizationDecision.builder()
                    .decision(allow ? AuthorizationDecision.Decision.ALLOW : AuthorizationDecision.Decision.DENY)
                    .policyVersion(policyVersionHash)
                    .policyVersionId(policyVersionId)
                    .reason(reason)
                    .runtimeUsed(mode())
                    .evaluationTraceId(traceId)
                    .build();
        } catch (Exception e) {
            if (failOpen) {
                return AuthorizationDecision.builder()
                        .decision(AuthorizationDecision.Decision.ALLOW)
                        .policyVersion(policyVersionHash)
                        .policyVersionId(policyVersionId)
                        .reason("OPA unavailable; fail-open enabled")
                        .runtimeUsed(mode())
                        .evaluationTraceId(traceId)
                        .build();
            }
            if (fallbackJsonOnError) {
                AuthorizationDecision fallback = jsonPolicyRuntime.evaluate(context, policyContent, policyVersionId, policyVersionHash);
                fallback.setRuntimeUsed("OPA_FALLBACK_JSON");
                fallback.setReason("OPA unavailable; fallback to JSON runtime: " + e.getMessage());
                fallback.setEvaluationTraceId(traceId);
                return fallback;
            }
            return AuthorizationDecision.builder()
                    .decision(AuthorizationDecision.Decision.DENY)
                    .policyVersion(policyVersionHash)
                    .policyVersionId(policyVersionId)
                    .reason("OPA evaluation failure: " + e.getMessage())
                    .runtimeUsed(mode())
                    .evaluationTraceId(traceId)
                    .build();
        }
    }
}
