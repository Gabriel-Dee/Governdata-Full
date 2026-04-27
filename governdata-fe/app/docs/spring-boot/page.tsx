import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"

export default function SpringBootPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        Spring Boot Integration
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Java-first integration blueprint</h1>
      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
        Keep your existing RBAC and patient data model, then layer Governance policy checks and audit forwarding around sensitive operations.
      </p>
      <p className="text-sm text-muted-foreground mb-12">
        For <strong className="text-foreground">who uses X-Admin-Secret vs X-API-Key</strong> when you add a management UI or BFF, see{" "}
        <Link href="/docs/security-auth" className="text-emerald-600 hover:underline">
          Security & authentication
        </Link>
        . All runtime calls require <code className="rounded bg-muted px-1">X-API-Key</code> and are tenant-scoped.
      </p>

      <section id="configuration" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">1) Spring Configuration</h2>
        <CodeBlock
          code={`governance:
  base-url: http://localhost:8080
  api-key: \${GOVERNANCE_API_KEY:} # tenant gdk_ key; required for /authorize, /audit/*, /compliance/*, /metrics`}
          language="yaml"
          filename="application.yml"
        />
      </section>

      <section id="webclient-bean" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">2) WebClient Bean</h2>
        <CodeBlock
          code={`@Configuration
public class GovernanceClientConfig {

    @Bean
    WebClient governanceWebClient(
            @Value("\${governance.base-url}") String baseUrl,
            @Value("\${governance.api-key:}") String apiKey
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeaders(headers -> {
                    if (apiKey != null && !apiKey.isBlank()) {
                        headers.add("X-API-Key", apiKey);
                    }
                })
                .build();
    }
}`}
          language="java"
          filename="GovernanceClientConfig.java"
        />
      </section>

      <section id="policy-enforcement" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">3) Enforce Policy Before Sensitive Data Access</h2>
        <CodeBlock
          code={`@Service
@RequiredArgsConstructor
public class PatientAccessService {
    private final GovernancePolicyClient governancePolicyClient;
    private final PatientRepository patientRepository;

    public PatientRecord getPatientRecord(UserPrincipal user, String patientId) {
        // Existing RBAC check in your app
        if (!user.hasRole("DOCTOR") && !user.hasRole("NURSE")) {
            throw new AccessDeniedException("RBAC denied");
        }

        AuthorizationRequest req = AuthorizationRequest.builder()
                .requestId(UUID.randomUUID())
                .subject(SubjectDTO.builder()
                        .userId(user.getUserId())
                        .role(user.getPrimaryRole())
                        .department(user.getDepartment())
                        .build())
                .resource(ResourceDTO.builder()
                        .type("PatientRecord")
                        .resourceId(patientId)
                        .build())
                .action("READ")
                .context(ContextDTO.builder()
                        .purpose("treatment")
                        .timestamp(Instant.now())
                        .attributes(Map.of(
                                "legalBasis", "HIPAA",
                                "consentGranted", true,
                                "region", "US",
                                "sourceSystem", "hospital-ehr"
                        ))
                        .build())
                .build();

        AuthorizationDecision decision = governancePolicyClient.authorize(req);
        if (decision.getDecision() != AuthorizationDecision.Decision.ALLOW) {
            throw new AccessDeniedException("Policy denied: " + decision.getReason());
        }

        return patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
    }
}`}
          language="java"
          filename="PatientAccessService.java"
        />
      </section>

      <section id="audit-forwarding" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">4) Forward Audit Events</h2>
        <CodeBlock
          code={`@Service
@RequiredArgsConstructor
public class GovernanceAuditClient {
    private final WebClient governanceWebClient;

    public void publishAuditEvent(String actor, String patientId, String action, String outcome) {
        AuditIngestRequest body = AuditIngestRequest.builder()
                .sourceSystem("hospital-ehr")
                .actor(actor)
                .targetResource(patientId)
                .action(action)
                .decision(outcome)
                .timestamp(Instant.now())
                .correlationId("ehr-" + UUID.randomUUID())
                .metadata(Map.of("module", "patient-service", "channel", "api"))
                .build();

        governanceWebClient.post()
                .uri("/api/v1/audit/ingest")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(AuditIngestResponse.class)
                .block();
    }
}`}
          language="java"
          filename="GovernanceAuditClient.java"
        />
      </section>

      <section className="rounded-xl border border-border p-6 bg-muted/30">
        <h3 className="font-semibold text-foreground mb-3">SDK Direction</h3>
        <p className="text-sm text-muted-foreground">
          These snippet patterns are the starting point for a reusable <code className="font-mono">governance-java-sdk</code> with typed models, retry/timeouts, auth interceptors, telemetry hooks, and versioned compatibility guarantees.
        </p>
      </section>
    </div>
  )
}
