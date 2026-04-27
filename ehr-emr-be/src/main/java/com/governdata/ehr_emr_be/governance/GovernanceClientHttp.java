package com.governdata.ehr_emr_be.governance;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

@Component
@ConditionalOnProperty(name = "governance.client.enabled", havingValue = "true", matchIfMissing = true)
public class GovernanceClientHttp implements GovernanceClient {

    private static final Logger log = LoggerFactory.getLogger(GovernanceClientHttp.class);
    private static final String AUTHORIZE_PATH = "/api/v1/authorize";
    private static final String AUDIT_INGEST_PATH = "/api/v1/audit/ingest";
    private static final String AUDIT_VERIFY_PATH = "/api/v1/audit/verify/";

    private final RestTemplate restTemplate;
    private final GovernanceClientProperties properties;

    public GovernanceClientHttp(RestTemplate governanceRestTemplate, GovernanceClientProperties properties) {
        this.restTemplate = governanceRestTemplate;
        this.properties = properties;
    }

    @Override
    public AuthorizationResponse authorize(AuthorizationRequest request) {
        if (!properties.isEnabled() || properties.getBaseUrl() == null || properties.getBaseUrl().isBlank()) {
            return AuthorizationResponse.allow("no-governance", Instant.now().plusSeconds(3600));
        }
        String url = properties.getBaseUrl().replaceAll("/$", "") + AUTHORIZE_PATH;
        HttpEntity<AuthorizationRequest> entity = new HttpEntity<>(request, buildJsonHeaders());
        try {
            ResponseEntity<AuthorizationResponseDto> response = restTemplate.postForEntity(url, entity, AuthorizationResponseDto.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                AuthorizationResponseDto dto = response.getBody();
                return new AuthorizationResponse(
                        "ALLOW".equalsIgnoreCase(dto.decision()),
                        dto.evaluationTraceId(),
                        dto.reason(),
                        null,
                        dto.decision(),
                        dto.runtimeUsed(),
                        dto.policyVersion(),
                        dto.evaluationTraceId()
                );
            }
            return AuthorizationResponse.deny("Governance returned " + response.getStatusCode());
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 403) {
                try {
                    AuthorizationResponseDto dto = e.getResponseBodyAs(AuthorizationResponseDto.class);
                    if (dto != null) {
                        return new AuthorizationResponse(false, dto.evaluationTraceId(), dto.reason(), null,
                                dto.decision(), dto.runtimeUsed(), dto.policyVersion(), dto.evaluationTraceId());
                    }
                } catch (Exception ignored) {
                }
                return AuthorizationResponse.deny(e.getResponseBodyAsString());
            }
            log.warn("Governance client error: {} {}", e.getStatusCode(), e.getMessage());
            return properties.isFailOpen()
                    ? AuthorizationResponse.allow("fail-open", Instant.now().plusSeconds(60))
                    : AuthorizationResponse.deny("Governance unavailable: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.warn("Governance client timeout/unreachable: {}", e.getMessage());
            return properties.isFailOpen()
                    ? AuthorizationResponse.allow("fail-open", Instant.now().plusSeconds(60))
                    : AuthorizationResponse.deny("Governance unreachable: " + e.getMessage());
        }
    }

    @Override
    public void ingestAudit(AuditIngestRequest request) {
        if (!properties.isEnabled() || !properties.isAuditIngestEnabled() || properties.getBaseUrl() == null || properties.getBaseUrl().isBlank()) {
            return;
        }
        String url = properties.getBaseUrl().replaceAll("/$", "") + AUDIT_INGEST_PATH;
        HttpEntity<AuditIngestRequest> entity = new HttpEntity<>(request, buildJsonHeaders());
        try {
            restTemplate.postForEntity(url, entity, AuditIngestResponse.class);
        } catch (Exception e) {
            if (properties.isFailOpen()) {
                log.warn("Governance audit ingest failed in fail-open mode: {}", e.getMessage());
                return;
            }
            throw e;
        }
    }

    @Override
    public AuditIngestResponse verifyAudit(String correlationId) {
        if (!properties.isEnabled() || properties.getBaseUrl() == null || properties.getBaseUrl().isBlank()) {
            return null;
        }
        String url = properties.getBaseUrl().replaceAll("/$", "") + AUDIT_VERIFY_PATH + correlationId;
        HttpEntity<Void> entity = new HttpEntity<>(buildJsonHeaders());
        ResponseEntity<AuditIngestResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, AuditIngestResponse.class);
        return response.getBody();
    }

    @Override
    public void revokeAccess(RevokeRequest request) {
        // Stub for future use; governance platform may expose POST /revoke
    }

    /**
     * DTO for JSON mapping (governance platform response).
     */
    private HttpHeaders buildJsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (properties.getApiKey() != null && !properties.getApiKey().isBlank()) {
            headers.set("X-API-Key", properties.getApiKey().trim());
        }
        return headers;
    }

    public record AuthorizationResponseDto(
            String decision,
            String reason,
            String runtimeUsed,
            String policyVersion,
            String evaluationTraceId
    ) {}
}
