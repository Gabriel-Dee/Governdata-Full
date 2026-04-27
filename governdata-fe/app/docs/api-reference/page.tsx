import Link from "next/link"
import { CodeBlock } from "@/components/code-block"
import { Badge } from "@/components/ui/badge"

export default function ApiReferencePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        API Reference
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Endpoint documentation</h1>
      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
        Summary of runtime and admin routes. The canonical copy-paste reference with every field is{" "}
        <a href="/developer-platform-api-guide.md" className="text-emerald-600 hover:underline">
          developer-platform-api-guide.md
        </a>
        .
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        <strong className="text-foreground">Auth:</strong> <code className="rounded bg-muted px-1">X-API-Key</code> on runtime routes (
        <code className="rounded bg-muted px-1">/authorize</code>, <code className="rounded bg-muted px-1">/audit/*</code>, <code className="rounded bg-muted px-1">/compliance/*</code>,{" "}
        <code className="rounded bg-muted px-1">/metrics</code>, <code className="rounded bg-muted px-1">/benchmark</code>).{" "}
        <code className="rounded bg-muted px-1">/api/v1/auth/register</code> and <code className="rounded bg-muted px-1">/api/v1/auth/login</code> are unauthenticated;{" "}
        <code className="rounded bg-muted px-1">/api/v1/portal/*</code> uses <code className="rounded bg-muted px-1">Authorization: Bearer &lt;jwt&gt;</code>.{" "}
        <code className="rounded bg-muted px-1">/api/v1/admin/*</code> uses <code className="rounded bg-muted px-1">X-Admin-Secret</code>. <code className="rounded bg-muted px-1">/actuator/*</code> open.{" "}
        <Link href="/register" className="text-emerald-600 hover:underline">
          Developer portal
        </Link>
        .
      </p>

      {/* Portal & auth */}
      <section id="portal-auth" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground mb-4">Portal & authentication (self-service)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Prefer <code className="rounded bg-muted px-1">POST /api/v1/auth/register</code> then <code className="rounded bg-muted px-1">POST /api/v1/portal/api-keys</code> to mint{" "}
          <code className="rounded bg-muted px-1">gdk_…</code> keys. See full field lists in the Markdown guide.
        </p>

        <h3 className="font-semibold text-foreground mb-2">POST /api/v1/auth/register</h3>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email":"admin@hospital.example",
    "password":"your-secure-password",
    "organizationDisplayName":"Mercy Health West",
    "tenantKey":"mercy-health-west",
    "displayName":"Jordan Lee"
  }'`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">POST /api/v1/auth/login</h3>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@hospital.example","password":"your-secure-password"}'`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">GET /api/v1/portal/me</h3>
        <CodeBlock
          code={`curl -s http://localhost:8080/api/v1/portal/me \\
  -H "Authorization: Bearer \${PORTAL_JWT}"`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">GET / POST /api/v1/portal/api-keys</h3>
        <CodeBlock
          code={`curl -s http://localhost:8080/api/v1/portal/api-keys \\
  -H "Authorization: Bearer \${PORTAL_JWT}"

curl -s -X POST http://localhost:8080/api/v1/portal/api-keys \\
  -H "Authorization: Bearer \${PORTAL_JWT}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"ehr-production"}'`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">DELETE /api/v1/portal/api-keys/{"{keyId}"}</h3>
        <CodeBlock
          code={`curl -s -X DELETE "http://localhost:8080/api/v1/portal/api-keys/1" \\
  -H "Authorization: Bearer \${PORTAL_JWT}"`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">GET /api/v1/portal/code-snippets</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Returns curl templates for HIPAA/GDPR authorize and audit ingest; base URL from <code className="rounded bg-muted px-1">GOVERNANCE_PUBLIC_BASE_URL</code>.
        </p>
        <CodeBlock
          code={`curl -s http://localhost:8080/api/v1/portal/code-snippets \\
  -H "Authorization: Bearer \${PORTAL_JWT}"`}
          language="bash"
        />
      </section>

      {/* Admin APIs */}
      <section id="admin-apis" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground mb-4">Admin provisioning (optional, X-Admin-Secret)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Register tenant, list tenants, tenant detail, issue API key. Full request/response shapes:{" "}
          <a href="/developer-platform-api-guide.md" className="text-emerald-600 hover:underline">
            API guide
          </a>
          .
        </p>

        <h3 className="font-semibold text-foreground mb-2">POST /api/v1/admin/tenants</h3>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/admin/tenants \\
  -H "X-Admin-Secret: \${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}" \\
  -H "Content-Type: application/json" \\
  -d '{"tenantKey":"acme-hospital","displayName":"Acme Hospital","primaryContactEmail":"it@acme-hospital.org"}'`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">GET /api/v1/admin/tenants</h3>
        <CodeBlock
          code={`curl -s http://localhost:8080/api/v1/admin/tenants \\
  -H "X-Admin-Secret: \${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}"`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">GET /api/v1/admin/tenants/{"{tenantId}"}</h3>
        <CodeBlock
          code={`curl -s "http://localhost:8080/api/v1/admin/tenants/2" \\
  -H "X-Admin-Secret: \${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}"`}
          language="bash"
        />

        <h3 className="font-semibold text-foreground mb-2 mt-6">POST /api/v1/admin/api-keys</h3>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/admin/api-keys \\
  -H "X-Admin-Secret: \${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}" \\
  -H "Content-Type: application/json" \\
  -d '{"tenantId":2,"name":"ehr-prod","expiresAt":null}'`}
          language="bash"
        />
      </section>

      {/* Health Check */}
      <section id="health-check" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
          <code className="text-lg font-mono">/actuator/health</code>
        </div>
        <p className="text-muted-foreground mb-4">Liveness/readiness probe. No auth.</p>
        <CodeBlock code="curl -s http://localhost:8080/actuator/health" language="bash" />
        <h4 className="font-semibold text-foreground mb-2 mt-4">Response</h4>
        <CodeBlock code={`{"groups":["liveness","readiness"],"status":"UP"}`} language="json" />
      </section>

      {/* Actuator info */}
      <section id="actuator-info" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
          <code className="text-lg font-mono">/actuator/info</code>
        </div>
        <p className="text-muted-foreground mb-4">Spring Boot application info when exposed. No auth.</p>
        <CodeBlock code="curl -s http://localhost:8080/actuator/info" language="bash" />
      </section>

      {/* Authorize */}
      <section id="authorize" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
          <code className="text-lg font-mono">/api/v1/authorize</code>
        </div>
        <p className="text-muted-foreground mb-2">
          Required header: <code className="rounded bg-muted px-1">X-API-Key: &lt;tenant-api-key&gt;</code>
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Role strings must match your active policy (e.g. seeded policy uses <code className="rounded bg-muted px-1">Doctor</code>, not <code className="rounded bg-muted px-1">DOCTOR</code>).
        </p>

        <h4 className="font-semibold text-foreground mb-2">cURL</h4>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/authorize \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId":"5a1e312f-b1c8-4af8-a6e8-a67bc4a53884",
    "subject":{"userId":"doctor-1","role":"Doctor","department":"Cardiology"},
    "resource":{"type":"PatientRecord","resourceId":"patient-123"},
    "action":"READ",
    "context":{
      "purpose":"treatment",
      "location":"hospital",
      "timestamp":"2026-03-26T00:00:00.000Z",
      "attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}
    }
  }'`}
          language="bash"
          filename="cURL"
        />

        <h4 className="font-semibold text-foreground mb-2 mt-4">Response</h4>
        <CodeBlock
          code={`{
  "decision":"DENY",
  "engine":"POLICY_CODE",
  "policyVersion":"e4ffff82ae1896b1a45c16a4d31ec2c1dbb496afdf60877df5d816767b66e4f5",
  "policyVersionId":1,
  "evidenceId":null,
  "reason":"No policy rule matched",
  "runtimeUsed":"JSON",
  "evaluationTraceId":"247c3213-c989-4643-ad81-63b8f754295c"
}`}
          language="json"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Errors: <Badge variant="outline">400</Badge> <Badge variant="outline">401</Badge> <Badge variant="outline">409</Badge> <Badge variant="outline">500</Badge>
        </p>
      </section>

      {/* Audit Get */}
      <section id="audit-get" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
          <code className="text-lg font-mono">/api/v1/audit/{"{requestId}"}</code>
        </div>
        <p className="text-muted-foreground mb-4">Normalized audit record for an authorization request.</p>
        <CodeBlock
          code={`curl -s "http://localhost:8080/api/v1/audit/5a1e312f-b1c8-4af8-a6e8-a67bc4a53884" \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}"`}
          language="bash"
        />
        <p className="text-sm text-muted-foreground mt-2">
          <Badge variant="outline">404</Badge> if no audit entry exists.
        </p>
      </section>

      {/* Audit Ingest */}
      <section id="audit-ingest" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
          <code className="text-lg font-mono">/api/v1/audit/ingest</code>
        </div>
        <p className="text-muted-foreground mb-4">Ingest external audit events. Requires <code className="rounded bg-muted px-1">X-API-Key</code>.</p>

        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/audit/ingest \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceSystem":"ehr",
    "actor":"doctor-1",
    "targetResource":"patient-123",
    "action":"READ",
    "decision":"ALLOW",
    "timestamp":"2026-03-26T00:00:00Z",
    "correlationId":"corr-1743000000",
    "metadata":{"module":"encounters","channel":"web"}
  }'`}
          language="bash"
        />

        <h4 className="font-semibold text-foreground mb-2 mt-4">Example success (BOTH + stub defaults)</h4>
        <p className="text-sm text-muted-foreground mb-2">
          With <code className="rounded bg-muted px-1">GOVERNANCE_AUDIT_STORAGE=BOTH</code> and{" "}
          <code className="rounded bg-muted px-1">GOVERNANCE_BLOCKCHAIN_STUB=true</code>, you may see <code className="rounded bg-muted px-1">stub-tx-*</code> and{" "}
          <code className="rounded bg-muted px-1">verificationStatus</code> such as <code className="rounded bg-muted px-1">ANCHORED</code>.
        </p>
        <CodeBlock
          code={`{
  "correlationId":"corr-1743000000",
  "eventHash":"6c9abcabcbd572eae407093000642aa43c6a5c20cc8109b5baa9e1a61fc7d4c2",
  "evidenceId":"stub-tx-xxxxxxxx",
  "chainNetwork":"hyperledger-fabric",
  "anchorTimestamp":"2026-03-28T12:00:00Z",
  "verificationStatus":"ANCHORED"
}`}
          language="json"
        />
      </section>

      {/* Audit Verify */}
      <section id="audit-verify" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
          <code className="text-lg font-mono">/api/v1/audit/verify/{"{correlationId}"}</code>
        </div>
        <CodeBlock
          code={`curl -s "http://localhost:8080/api/v1/audit/verify/corr-1743000000" \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}"`}
          language="bash"
        />
        <p className="text-sm text-muted-foreground mt-4">
          Statuses: <code className="rounded bg-muted px-1">VERIFIED</code>, <code className="rounded bg-muted px-1">MISMATCH</code>,{" "}
          <code className="rounded bg-muted px-1">NOT_FOUND</code>.
        </p>
      </section>

      {/* Metrics */}
      <section id="metrics" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
          <code className="text-lg font-mono">/api/v1/metrics</code>
        </div>
        <CodeBlock
          code={`curl -s http://localhost:8080/api/v1/metrics \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}"`}
          language="bash"
        />
        <p className="text-sm text-muted-foreground mt-4">
          Includes <code className="rounded bg-muted px-1">decisionCountByEngine</code>, <code className="rounded bg-muted px-1">denyCountByEngine</code>,{" "}
          <code className="rounded bg-muted px-1">latencyByEngine[]</code>.
        </p>
      </section>

      {/* Compliance catalog */}
      <section id="compliance-catalog" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
          <code className="text-lg font-mono">/api/v1/compliance/catalog</code>
        </div>
        <p className="text-muted-foreground mb-4">
          Seeded HIPAA/GDPR rule catalog. Query <code className="rounded bg-muted px-1">framework=HIPAA</code>, <code className="rounded bg-muted px-1">GDPR</code>, or{" "}
          <code className="rounded bg-muted px-1">ALL</code>.
        </p>
        <CodeBlock
          code={`curl -s "http://localhost:8080/api/v1/compliance/catalog?framework=HIPAA" \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}"`}
          language="bash"
        />
      </section>

      {/* Compliance evaluate */}
      <section id="compliance-evaluate" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
          <code className="text-lg font-mono">/api/v1/compliance/evaluate</code>
        </div>
        <p className="text-muted-foreground mb-4">Score submitted evidence flags against catalog rules.</p>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/compliance/evaluate \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}" \\
  -H "Content-Type: application/json" \\
  -d '{"frameworks":["HIPAA"],"evidence":{"hipaa_audit_controls":true,"hipaa_access_unique_user_id":false}}'`}
          language="bash"
        />
      </section>

      {/* Benchmark */}
      <section id="benchmark" className="mb-12 rounded-lg border border-border p-6 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
          <code className="text-lg font-mono">/api/v1/benchmark/policy-runtime</code>
        </div>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/benchmark/policy-runtime \\
  -H "X-API-Key: \${GOVERNANCE_API_KEY:-<tenant-api-key>}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "iterations": 3,
    "requests": [{
      "requestId":"e3b38039-63bf-4ab0-b9c0-4ff4d27eeb5d",
      "subject":{"userId":"doctor-2","role":"Doctor","department":"ICU"},
      "resource":{"type":"PatientRecord","resourceId":"patient-456"},
      "action":"READ",
      "context":{
        "purpose":"treatment",
        "timestamp":"2026-03-26T00:00:00.000Z",
        "attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}
      }
    }]
  }'`}
          language="bash"
        />
        <h4 className="font-semibold text-foreground mb-2 mt-4">Response</h4>
        <CodeBlock
          code={`{
  "runtime":"JSON",
  "iterations":3,
  "totalRequests":1,
  "totalEvaluations":3,
  "allowCount":0,
  "denyCount":3,
  "averageLatencyMs":6.0,
  "p95LatencyMs":7
}`}
          language="json"
        />
      </section>

      {/* Error Contract */}
      <section id="error-contract" className="rounded-lg border border-border p-6 scroll-mt-24">
        <h3 className="text-xl font-semibold text-foreground mb-3">Error contract</h3>
        <CodeBlock
          code={`{
  "timestamp":"2026-03-26T17:40:00.000Z",
  "status":400,
  "error":"Bad Request",
  "message":"Validation failed",
  "path":"/api/v1/authorize",
  "violations":[
    {"field":"subject.userId","message":"subject.userId is required","rejectedValue":""}
  ]
}`}
          language="json"
        />
        <p className="text-sm text-muted-foreground mt-4">
          Common: <code className="rounded bg-muted px-1">200</code>, <code className="rounded bg-muted px-1">400</code>,{" "}
          <code className="rounded bg-muted px-1">401</code> (missing/invalid <code className="rounded bg-muted px-1">X-API-Key</code> or admin secret),{" "}
          <code className="rounded bg-muted px-1">404</code>, <code className="rounded bg-muted px-1">409</code>, <code className="rounded bg-muted px-1">500</code>.
        </p>
      </section>
    </div>
  )
}
