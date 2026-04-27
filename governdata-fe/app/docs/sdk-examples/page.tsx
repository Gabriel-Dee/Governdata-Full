import { CodeBlock } from "@/components/code-block"
import { Badge } from "@/components/ui/badge"

export default function SdkExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        SDK Examples
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Code examples</h1>
      <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
        Runtime examples use <code className="rounded bg-muted px-1 text-sm">X-API-Key</code>. In production, load the key from a secret store or server env — never expose <code className="rounded bg-muted px-1 text-sm">gdk_…</code> keys in a public browser bundle.
      </p>
      <p className="text-sm text-muted-foreground mb-12">
        Role strings must match your policy (seeded default uses <code className="rounded bg-muted px-1">Doctor</code>).
      </p>

      <section id="javascript" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">JavaScript / TypeScript</h2>
        <p className="text-muted-foreground mb-4">
          Server-side or trusted context with <code className="rounded bg-muted px-1 font-mono">process.env.GOVERNANCE_API_KEY</code>:
        </p>
        <CodeBlock
          code={`const res = await fetch("http://localhost:8080/api/v1/authorize", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.GOVERNANCE_API_KEY!,
  },
  body: JSON.stringify({
    requestId: crypto.randomUUID(),
    subject: {
      userId: "doctor-1",
      role: "Doctor",
      department: "Cardiology",
    },
    resource: { type: "PatientRecord", resourceId: "patient-123" },
    action: "READ",
    context: {
      purpose: "treatment",
      location: "hospital",
      timestamp: new Date().toISOString(),
      attributes: { legalBasis: "HIPAA", consentGranted: true, region: "US" },
    },
  }),
});

const data = await res.json();
console.log(data.decision); // "ALLOW" or "DENY"`}
          language="typescript"
          filename="authorize.ts"
        />
      </section>

      <section id="python" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Python</h2>
        <CodeBlock
          code={`import uuid
import requests
import datetime
import os

payload = {
    "requestId": str(uuid.uuid4()),
    "subject": {"userId": "doctor-1", "role": "Doctor", "department": "Cardiology"},
    "resource": {"type": "PatientRecord", "resourceId": "patient-123"},
    "action": "READ",
    "context": {
        "purpose": "treatment",
        "location": "hospital",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "attributes": {"legalBasis": "HIPAA", "consentGranted": True, "region": "US"},
    },
}

r = requests.post(
    "http://localhost:8080/api/v1/authorize",
    headers={"X-API-Key": os.environ.get("GOVERNANCE_API_KEY", "<tenant-api-key>")},
    json=payload,
    timeout=10,
)
print(r.status_code, r.json())`}
          language="python"
          filename="authorize.py"
        />
      </section>

      <section id="curl" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">cURL</h2>
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
          filename="Terminal"
        />
      </section>

      <section id="audit-ingest" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Audit ingestion (TypeScript)</h2>
        <CodeBlock
          code={`const ingestAuditEvent = async (apiKey: string, event: {
  sourceSystem: string;
  actor: string;
  targetResource: string;
  action: string;
  decision: "ALLOW" | "DENY";
  metadata?: Record<string, unknown>;
}) => {
  const response = await fetch("http://localhost:8080/api/v1/audit/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
      correlationId: \`corr-\${crypto.randomUUID()}\`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};`}
          language="typescript"
          filename="audit-ingest.ts"
        />
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6">
        <h3 className="font-semibold text-foreground mb-4">Integration best practices</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
            <div>
              <strong className="text-foreground">Generate IDs client-side:</strong> new UUIDs for <code className="font-mono">requestId</code>; treat <code className="font-mono">correlationId</code> as immutable event identity.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
            <div>
              <strong className="text-foreground">401 handling:</strong> missing or invalid <code className="font-mono">X-API-Key</code> returns 401 — rotate keys and verify tenant scope.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
            <div>
              <strong className="text-foreground">Store artifacts:</strong> persist <code className="font-mono">evaluationTraceId</code>, <code className="font-mono">policyVersion</code>, <code className="font-mono">evidenceId</code> where applicable.
            </div>
          </li>
        </ul>
      </section>
    </div>
  )
}
