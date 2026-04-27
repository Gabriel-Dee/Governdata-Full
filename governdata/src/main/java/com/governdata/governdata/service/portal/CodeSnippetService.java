package com.governdata.governdata.service.portal;

import com.governdata.governdata.api.dto.portal.CodeSnippetBlockDto;
import com.governdata.governdata.api.dto.portal.CodeSnippetsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CodeSnippetService {

    @Value("${governance.portal.public-base-url:http://localhost:8080}")
    private String publicBaseUrl;

    public CodeSnippetsResponse buildSnippets() {
        String base = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;
        return CodeSnippetsResponse.builder()
                .publicBaseUrl(base)
                .apiKeyPlaceholder("YOUR_API_KEY")
                .policyHipaa(CodeSnippetBlockDto.builder()
                        .id("policy-hipaa")
                        .title("Policy as code — HIPAA framing")
                        .description(
                                "Calls POST /api/v1/authorize with legalBasis HIPAA in context.attributes. "
                                        + "Use the same X-API-Key you created in the dashboard for your EMR or BFF."
                        )
                        .curl(hipaaAuthorizeCurl(base))
                        .build())
                .policyGdpr(CodeSnippetBlockDto.builder()
                        .id("policy-gdpr")
                        .title("Policy as code — GDPR framing")
                        .description(
                                "Same authorize endpoint with GDPR-oriented attributes (e.g. region EU, legal basis). "
                                        + "Replace UUIDs and subject/resource with your application identifiers."
                        )
                        .curl(gdprAuthorizeCurl(base))
                        .build())
                .auditIngest(CodeSnippetBlockDto.builder()
                        .id("audit-ingest")
                        .title("Immutable audit pipeline (anchor + verify)")
                        .description(
                                "POST /api/v1/audit/ingest anchors operational events (stub-tx-* when GOVERNANCE_BLOCKCHAIN_STUB=true). "
                                        + "Use GET /api/v1/audit/verify/{correlationId} with the same API key."
                        )
                        .curl(auditIngestCurl(base))
                        .build())
                .build();
    }

    private static String hipaaAuthorizeCurl(String base) {
        return """
                curl -s -X POST %s/api/v1/authorize \\
                  -H "X-API-Key: YOUR_API_KEY" \\
                  -H "Content-Type: application/json" \\
                  -d '{
                    "requestId":"00000000-0000-4000-8000-000000000001",
                    "subject":{"userId":"doctor-1","role":"Doctor","department":"Cardiology"},
                    "resource":{"type":"PatientRecord","resourceId":"patient-123"},
                    "action":"READ",
                    "context":{
                      "purpose":"treatment",
                      "location":"hospital",
                      "timestamp":"2026-03-28T12:00:00.000Z",
                      "attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}
                    }
                  }'
                """.formatted(base).strip();
    }

    private static String gdprAuthorizeCurl(String base) {
        return """
                curl -s -X POST %s/api/v1/authorize \\
                  -H "X-API-Key: YOUR_API_KEY" \\
                  -H "Content-Type: application/json" \\
                  -d '{
                    "requestId":"00000000-0000-4000-8000-000000000002",
                    "subject":{"userId":"clinician-1","role":"Doctor","department":"Outpatient"},
                    "resource":{"type":"PatientRecord","resourceId":"patient-456"},
                    "action":"READ",
                    "context":{
                      "purpose":"treatment",
                      "location":"clinic",
                      "timestamp":"2026-03-28T12:00:00.000Z",
                      "attributes":{"legalBasis":"GDPR","consentGranted":true,"region":"EU"}
                    }
                  }'
                """.formatted(base).strip();
    }

    private static String auditIngestCurl(String base) {
        return """
                curl -s -X POST %s/api/v1/audit/ingest \\
                  -H "X-API-Key: YOUR_API_KEY" \\
                  -H "Content-Type: application/json" \\
                  -d '{
                    "sourceSystem":"ehr",
                    "actor":"doctor-1",
                    "targetResource":"patient-123",
                    "action":"READ",
                    "decision":"ALLOW",
                    "timestamp":"2026-03-28T12:00:00Z",
                    "correlationId":"example-corr-0001",
                    "metadata":{"module":"encounters","channel":"integration"}
                  }'
                """.formatted(base).strip();
    }
}
