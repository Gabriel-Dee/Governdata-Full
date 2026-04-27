import { CodeBlock } from "@/components/code-block"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        Getting Started
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Quick start guide</h1>
      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
        Policy-as-code (<code className="rounded bg-muted px-1 text-sm">/api/v1/authorize</code>) and verifiable audit (
        <code className="rounded bg-muted px-1 text-sm">/api/v1/audit/*</code>).
      </p>
      <p className="text-sm text-muted-foreground mb-10">
        <strong className="text-foreground">Self-service (recommended):</strong> register → portal API keys → <code className="rounded bg-muted px-1">X-API-Key</code> on runtime APIs.{" "}
        <Link href="/register" className="text-emerald-600 hover:underline">
          Developer portal
        </Link>
        .
      </p>

      <section id="base-url" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Base URL and transport</h2>
        <div className="space-y-3 mb-6 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-36 shrink-0">Base URL (local):</span>
            <code className="rounded bg-muted px-2 py-1 font-mono">http://localhost:8080</code>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-36 shrink-0">Runtime APIs:</span>
            <span className="text-foreground">
              <code className="rounded bg-muted px-1">X-API-Key</code> on <code className="rounded bg-muted px-1">/api/v1/authorize</code>, <code className="rounded bg-muted px-1">/audit/*</code>,{" "}
              <code className="rounded bg-muted px-1">/compliance/*</code>, <code className="rounded bg-muted px-1">/metrics</code>, etc.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-36 shrink-0">Portal / auth:</span>
            <span className="text-foreground">
              <code className="rounded bg-muted px-1">/api/v1/auth/*</code> (register, login) — no API key; <code className="rounded bg-muted px-1">/api/v1/portal/*</code> —{" "}
              <code className="rounded bg-muted px-1">Authorization: Bearer &lt;jwt&gt;</code>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-36 shrink-0">Operator (optional):</span>
            <span className="text-foreground">
              <code className="rounded bg-muted px-1">X-Admin-Secret</code> on <code className="rounded bg-muted px-1">/api/v1/admin/*</code>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground w-36 shrink-0">Actuator:</span>
            <span className="text-foreground">
              <code className="rounded bg-muted px-1">/actuator/health</code>, <code className="rounded bg-muted px-1">/actuator/info</code> — no auth
            </span>
          </div>
        </div>
      </section>

      <section id="architecture-flow" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Integration architecture</h2>
        <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
          <li>Authenticate users and apply local RBAC first.</li>
          <li>Before sensitive reads/writes, call <code className="rounded bg-muted px-1 font-mono">POST /api/v1/authorize</code> with <code className="rounded bg-muted px-1 font-mono">X-API-Key</code>.</li>
          <li>If <code className="rounded bg-muted px-1 font-mono">ALLOW</code>, proceed; otherwise block.</li>
          <li>Optional: <code className="rounded bg-muted px-1 font-mono">POST /api/v1/audit/ingest</code> and <code className="rounded bg-muted px-1 font-mono">GET /api/v1/audit/verify/{"{id}"}</code>.</li>
        </ol>
      </section>

      <section id="health-check" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">1. Health check</h2>
        <CodeBlock code="curl -s http://localhost:8080/actuator/health" language="bash" filename="Terminal" />
        <div className="mt-3">
          <CodeBlock code={`{"groups":["liveness","readiness"],"status":"UP"}`} language="json" />
        </div>
      </section>

      <section id="self-service" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">2. Self-service: register, mint API key, authorize</h2>
        <p className="text-muted-foreground mb-4 text-sm">Recommended path — no <code className="rounded bg-muted px-1">X-Admin-Secret</code> required.</p>
        <CodeBlock
          code={`# 1) Register (returns JWT + tenant info)
curl -s -X POST http://localhost:8080/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"dev@acme-hospital.org","password":"your-secure-password","organizationDisplayName":"Acme Hospital","tenantKey":"acme-hospital"}'

# 2) Create an API key (use accessToken from step 1)
curl -s -X POST http://localhost:8080/api/v1/portal/api-keys \\
  -H "Authorization: Bearer <accessToken>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"ehr-prod"}'

# 3) Call runtime APIs with X-API-Key (gdk_… from step 2)
curl -s -X POST http://localhost:8080/api/v1/authorize \\
  -H "X-API-Key: <tenant-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId":"5a1e312f-b1c8-4af8-a6e8-a67bc4a53884",
    "subject":{"userId":"doctor-1","role":"Doctor","department":"Cardiology"},
    "resource":{"type":"PatientRecord","resourceId":"patient-123"},
    "action":"READ",
    "context":{
      "purpose":"treatment",
      "timestamp":"2026-03-26T00:00:00.000Z",
      "attributes":{"legalBasis":"HIPAA","consentGranted":true,"region":"US"}
    }
  }'`}
          language="bash"
          filename="cURL"
        />
      </section>

      <section id="provision" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">3. Optional: operator bootstrap</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Legacy provisioning with <code className="rounded bg-muted px-1">X-Admin-Secret</code> — full details in{" "}
          <a href="/developer-platform-api-guide.md" className="text-emerald-600 hover:underline">
            developer-platform-api-guide.md
          </a>
          .
        </p>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/admin/tenants \\
  -H "X-Admin-Secret: \${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}" \\
  -H "Content-Type: application/json" \\
  -d '{"tenantKey":"acme-hospital","displayName":"Acme Hospital","primaryContactEmail":"it@acme-hospital.org"}'

curl -s -X POST http://localhost:8080/api/v1/admin/api-keys \\
  -H "X-Admin-Secret: \${GOVERNANCE_ADMIN_SECRET:-change-me-admin-secret}" \\
  -H "Content-Type: application/json" \\
  -d '{"tenantId":2,"name":"ehr-prod"}'`}
          language="bash"
          filename="Admin cURL"
        />
      </section>

      <section className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">4. First audit ingestion</h2>
        <CodeBlock
          code={`curl -s -X POST http://localhost:8080/api/v1/audit/ingest \\
  -H "X-API-Key: <tenant-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceSystem":"hospital-ehr",
    "actor":"doctor-1",
    "targetResource":"patient-123",
    "action":"READ",
    "decision":"ALLOW",
    "timestamp":"2026-03-26T00:00:00Z",
    "correlationId":"corr-1743000000",
    "metadata":{"module":"encounters"}
  }'`}
          language="bash"
          filename="cURL"
        />
      </section>

      <section className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">5. Compliance catalog (optional)</h2>
        <CodeBlock
          code={`curl -s "http://localhost:8080/api/v1/compliance/catalog?framework=ALL" \\
  -H "X-API-Key: <tenant-api-key>"

curl -s -X POST http://localhost:8080/api/v1/compliance/evaluate \\
  -H "X-API-Key: <tenant-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"frameworks":["HIPAA","GDPR"],"evidence":{"hipaa_audit_controls":true}}'`}
          language="bash"
          filename="cURL"
        />
      </section>

      <section className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Environment variables (server)</h2>
        <CodeBlock
          code={`DB_USERNAME=
DB_PASSWORD=
GOVERNANCE_POLICY_RUNTIME=JSON
GOVERNANCE_AUDIT_STORAGE=BOTH
GOVERNANCE_BLOCKCHAIN_STUB=true
GOVERNANCE_AUTH_API_KEY_ENABLED=true
GOVERNANCE_ADMIN_SECRET=change-me-admin-secret
GOVERNANCE_JWT_SECRET=
GOVERNANCE_PUBLIC_BASE_URL=http://localhost:8080
GOVERNANCE_API_KEY=
OPA_URL=
OPA_FAIL_OPEN=false
BLOCKCHAIN_NETWORK=hyperledger-fabric`}
          language="bash"
          filename="Shell"
        />
      </section>

      <section id="smoke-validation" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">6. Smoke validation</h2>
        <CodeBlock code="scripts/smoke-curl.sh" language="bash" filename="Terminal" />
        <p className="text-sm text-muted-foreground mt-2">Exercises major endpoints; exits non-zero on failure.</p>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6">
        <h3 className="font-semibold text-foreground mb-3">Next steps</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <Link href="/register" className="text-emerald-600 hover:underline">
              Developer portal (register)
            </Link>
          </li>
          <li>
            <Link href="/docs/security-auth" className="text-emerald-600 hover:underline">
              Security & authentication
            </Link>
          </li>
          <li>
            <Link href="/docs/api-guide" className="text-emerald-600 hover:underline">
              API guide index
            </Link>
          </li>
          <li>
            <Link href="/docs/api-reference" className="text-emerald-600 hover:underline">
              In-app API reference
            </Link>
          </li>
          <li>
            <Link href="/docs/concepts" className="text-emerald-600 hover:underline">
              Core concepts
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
