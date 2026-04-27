import { CodeBlock } from "@/components/code-block"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DocsContent() {
  return (
    <div className="flex-1 min-w-0">
      {/* Getting Started */}
      <section id="getting-started" className="scroll-mt-20">
        <h2 id="introduction" className="scroll-mt-20 text-2xl font-bold text-foreground mb-4">Getting Started</h2>
        <p className="text-muted-foreground mb-6">
          This guide is for developers integrating existing systems (EHR/EMR, internal apps, SaaS backends) 
          with the Governance Platform API. It explains what each endpoint does, when to call it, 
          request/response contracts, error handling expectations, and integration patterns.
        </p>

        <h3 id="base-url" className="scroll-mt-20 text-xl font-semibold text-foreground mb-4 mt-8">Base URL and Transport</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-32">Base URL (local):</span>
            <code className="rounded bg-muted px-2 py-1 text-sm">http://localhost:8080</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-32">Content type:</span>
            <code className="rounded bg-muted px-2 py-1 text-sm">application/json</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-32">Protocol:</span>
            <span className="text-sm text-foreground">REST over HTTPS/HTTP</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-32">Auth today:</span>
            <span className="text-sm text-foreground">Open endpoints (<code className="rounded bg-muted px-1">/api/v1/**</code>, <code className="rounded bg-muted px-1">/actuator/**</code>)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-32">Auth roadmap:</span>
            <span className="text-sm text-foreground">Add gateway/JWT at deployment perimeter</span>
          </div>
        </div>

        <h3 id="quick-start" className="scroll-mt-20 text-xl font-semibold text-foreground mb-4 mt-8">Quick Start</h3>
        <p className="text-muted-foreground mb-4">
          Use the smoke validation script to verify your setup:
        </p>
        <CodeBlock 
          code="scripts/smoke-curl.sh"
          language="bash"
          filename="Terminal"
        />
        <p className="text-sm text-muted-foreground mt-2">
          The script exercises all major endpoints and exits non-zero on failures.
        </p>
      </section>

      {/* Core Concepts */}
      <section id="concepts" className="scroll-mt-20 mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">Core Concepts</h2>

        <h3 id="policy-runtime" className="scroll-mt-20 text-xl font-semibold text-foreground mb-4 mt-8">Policy Enforcement Runtime</h3>
        <p className="text-muted-foreground mb-4">
          Requests are evaluated by the <code className="rounded bg-muted px-1">POLICY_CODE</code> engine using one of two runtimes:
        </p>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">JSON Runtime (default)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Evaluates JSON DSL policies stored in the database.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">OPA Runtime</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Delegates decisions to OPA/Rego endpoint.</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Configured via environment variables:</p>
        <CodeBlock 
          code={`GOVERNANCE_POLICY_RUNTIME=JSON|OPA
OPA_URL=<required when OPA>`}
          language="bash"
        />

        <h3 id="audit-storage" className="scroll-mt-20 text-xl font-semibold text-foreground mb-4 mt-8">Audit Storage Mode</h3>
        <p className="text-muted-foreground mb-4">
          Configure via <code className="rounded bg-muted px-1">GOVERNANCE_AUDIT_STORAGE</code>:
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mode</TableHead>
              <TableHead>Behavior</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="rounded bg-muted px-1">DB_ONLY</code></TableCell>
              <TableCell>Stores decision/event in Postgres</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="rounded bg-muted px-1">BLOCKCHAIN_ONLY</code></TableCell>
              <TableCell>Anchors to Fabric only</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="rounded bg-muted px-1">BOTH</code></TableCell>
              <TableCell>Writes DB + blockchain evidence</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <h3 id="ids-uniqueness" className="scroll-mt-20 text-xl font-semibold text-foreground mb-4 mt-8">IDs and Uniqueness</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><code className="rounded bg-muted px-1">requestId</code> for <code className="rounded bg-muted px-1">/authorize</code> must be unique per request</li>
          <li><code className="rounded bg-muted px-1">correlationId</code> for <code className="rounded bg-muted px-1">/audit/ingest</code> must be unique per event</li>
          <li>Duplicates return <Badge variant="destructive">409 Conflict</Badge> with clear message</li>
        </ul>
      </section>

      {/* API Reference */}
      <section id="api-reference" className="scroll-mt-20 mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">API Reference</h2>

        {/* Health Check */}
        <div id="health-check" className="scroll-mt-20 mt-8 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
            <code className="text-lg font-mono">/actuator/health</code>
          </div>
          <p className="text-muted-foreground mb-4">Liveness/readiness probe for service health.</p>
          <h4 className="font-semibold text-foreground mb-2">Use Cases</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
            <li>Kubernetes probe</li>
            <li>CI smoke checks</li>
            <li>Pre-flight before integration tests</li>
          </ul>
          <h4 className="font-semibold text-foreground mb-2">Example</h4>
          <CodeBlock 
            code="curl -s http://localhost:8080/actuator/health"
            language="bash"
          />
          <h4 className="font-semibold text-foreground mb-2 mt-4">Response</h4>
          <CodeBlock 
            code={`{"groups":["liveness","readiness"],"status":"UP"}`}
            language="json"
          />
        </div>

        {/* Authorize */}
        <div id="authorize" className="scroll-mt-20 mt-8 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
            <code className="text-lg font-mono">/api/v1/authorize</code>
          </div>
          <p className="text-muted-foreground mb-4">
            Evaluate one access request against active policy and return <code className="rounded bg-muted px-1">ALLOW</code>/<code className="rounded bg-muted px-1">DENY</code>.
          </p>
          
          <h4 className="font-semibold text-foreground mb-2">Request Body</h4>
          <Table className="mb-4">
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><code>requestId</code></TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Unique identifier for this request</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>subject</code></TableCell>
                <TableCell>Object</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Contains userId, role, department (optional)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>resource</code></TableCell>
                <TableCell>Object</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Contains type, resourceId</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>action</code></TableCell>
                <TableCell>String</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Action being performed (READ, WRITE, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>context</code></TableCell>
                <TableCell>Object</TableCell>
                <TableCell>No</TableCell>
                <TableCell>purpose, location, timestamp, attributes</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <h4 className="font-semibold text-foreground mb-2">cURL Example</h4>
          <CodeBlock 
            code={`curl -s -X POST http://localhost:8080/api/v1/authorize \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId":"5a1e312f-b1c8-4af8-a6e8-a67bc4a53884",
    "subject":{"userId":"doctor-1","role":"DOCTOR","department":"Cardiology"},
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

          <h4 className="font-semibold text-foreground mb-2 mt-4">Response Fields</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><code>decision</code></TableCell>
                <TableCell>ALLOW or DENY</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>engine</code></TableCell>
                <TableCell>Currently POLICY_CODE</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>policyVersion</code></TableCell>
                <TableCell>Active policy content hash</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>evidenceId</code></TableCell>
                <TableCell>Blockchain tx id when anchored</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>reason</code></TableCell>
                <TableCell>Explanation for decision</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>runtimeUsed</code></TableCell>
                <TableCell>JSON or OPA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>evaluationTraceId</code></TableCell>
                <TableCell>Trace token for troubleshooting</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Audit Get */}
        <div id="audit-get" className="scroll-mt-20 mt-8 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
            <code className="text-lg font-mono">/api/v1/audit/{"{requestId}"}</code>
          </div>
          <p className="text-muted-foreground mb-4">Retrieve normalized audit record for an authorization request.</p>
          
          <h4 className="font-semibold text-foreground mb-2">Path Parameters</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground mb-4">
            <li><code className="rounded bg-muted px-1">requestId</code> (UUID) - The authorization request ID</li>
          </ul>

          <h4 className="font-semibold text-foreground mb-2">Example</h4>
          <CodeBlock 
            code="curl -s http://localhost:8080/api/v1/audit/5a1e312f-b1c8-4af8-a6e8-a67bc4a53884"
            language="bash"
          />

          <h4 className="font-semibold text-foreground mb-2 mt-4">Response Includes</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Request envelope (subject/resource/action/context)</li>
            <li>Decision envelope (decision/engineUsed/reason/latencyMs)</li>
            <li>Verification envelope (eventHash/chainNetwork/anchorTimestamp/verificationStatus)</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Returns <Badge variant="outline">404</Badge> if no audit entry exists for the given request id.
          </p>
        </div>

        {/* Audit Ingest */}
        <div id="audit-ingest" className="scroll-mt-20 mt-8 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
            <code className="text-lg font-mono">/api/v1/audit/ingest</code>
          </div>
          <p className="text-muted-foreground mb-4">Ingest external audit events from other systems into governance audit model.</p>
          
          <h4 className="font-semibold text-foreground mb-2">Request Body</h4>
          <Table className="mb-4">
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><code>sourceSystem</code></TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Origin system identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>actor</code></TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>User/service performing action</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>targetResource</code></TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Resource being accessed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>action</code></TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Action performed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>decision</code></TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>ALLOW or DENY</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>timestamp</code></TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>ISO instant timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>correlationId</code></TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Unique event identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>metadata</code></TableCell>
                <TableCell>No</TableCell>
                <TableCell>Free-form object</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <h4 className="font-semibold text-foreground mb-2">Example</h4>
          <CodeBlock 
            code={`curl -s -X POST http://localhost:8080/api/v1/audit/ingest \\
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

          <h4 className="font-semibold text-foreground mb-2 mt-4">Response</h4>
          <CodeBlock 
            code={`{
  "correlationId":"corr-1743000000",
  "eventHash":"6c9abcabcbd572eae407093000642aa43c6a5c20cc8109b5baa9e1a61fc7d4c2",
  "evidenceId":null,
  "chainNetwork":null,
  "anchorTimestamp":null,
  "verificationStatus":"DB_ONLY"
}`}
            language="json"
          />
        </div>

        {/* Audit Verify */}
        <div id="audit-verify" className="scroll-mt-20 mt-8 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
            <code className="text-lg font-mono">/api/v1/audit/verify/{"{correlationId}"}</code>
          </div>
          <p className="text-muted-foreground mb-4">Verify ingested audit event consistency and blockchain anchor (if present).</p>
          
          <h4 className="font-semibold text-foreground mb-2">Example</h4>
          <CodeBlock 
            code="curl -s http://localhost:8080/api/v1/audit/verify/corr-1743000000"
            language="bash"
          />

          <h4 className="font-semibold text-foreground mb-2 mt-4">Verification Statuses</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Meaning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-green-500/10 text-green-600">VERIFIED</Badge></TableCell>
                <TableCell>Event record is consistent (blockchain check passes when evidence exists)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-yellow-500/10 text-yellow-600">MISMATCH</Badge></TableCell>
                <TableCell>Evidence exists but verification failed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-red-500/10 text-red-600">NOT_FOUND</Badge></TableCell>
                <TableCell>No event for given correlation id</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Metrics */}
        <div id="metrics" className="scroll-mt-20 mt-8 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">GET</Badge>
            <code className="text-lg font-mono">/api/v1/metrics</code>
          </div>
          <p className="text-muted-foreground mb-4">Operational decision metrics and latency stats.</p>
          
          <h4 className="font-semibold text-foreground mb-2">Example</h4>
          <CodeBlock 
            code="curl -s http://localhost:8080/api/v1/metrics"
            language="bash"
          />

          <h4 className="font-semibold text-foreground mb-2 mt-4">Response Includes</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li><code className="rounded bg-muted px-1">decisionCountByEngine</code></li>
            <li><code className="rounded bg-muted px-1">denyCountByEngine</code></li>
            <li><code className="rounded bg-muted px-1">latencyByEngine[]</code> with avgMs, minMs, maxMs, p50Ms, p95Ms, p99Ms</li>
          </ul>
        </div>

        {/* Benchmark */}
        <div id="benchmark" className="scroll-mt-20 mt-8 rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">POST</Badge>
            <code className="text-lg font-mono">/api/v1/benchmark/policy-runtime</code>
          </div>
          <p className="text-muted-foreground mb-4">Run controlled benchmark over a corpus of authorization requests.</p>
          
          <h4 className="font-semibold text-foreground mb-2">Request Body</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
            <li><code className="rounded bg-muted px-1">requests</code> (required) - Non-empty array of AuthorizationRequest</li>
            <li><code className="rounded bg-muted px-1">iterations</code> (optional) - Minimum 1, default 1</li>
          </ul>

          <h4 className="font-semibold text-foreground mb-2">Example</h4>
          <CodeBlock 
            code={`curl -s -X POST http://localhost:8080/api/v1/benchmark/policy-runtime \\
  -H "Content-Type: application/json" \\
  -d '{
    "iterations": 3,
    "requests": [{
      "requestId":"e3b38039-63bf-4ab0-b9c0-4ff4d27eeb5d",
      "subject":{"userId":"doctor-2","role":"DOCTOR","department":"ICU"},
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
        </div>
      </section>

      {/* SDK Examples */}
      <section id="sdk-examples" className="scroll-mt-20 mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">SDK Examples</h2>

        <div id="sdk-js" className="scroll-mt-20 mt-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">JavaScript/TypeScript</h3>
          <CodeBlock 
            code={`const res = await fetch("http://localhost:8080/api/v1/authorize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    requestId: crypto.randomUUID(),
    subject: { userId: "doctor-1", role: "DOCTOR", department: "Cardiology" },
    resource: { type: "PatientRecord", resourceId: "patient-123" },
    action: "READ",
    context: {
      purpose: "treatment",
      location: "hospital",
      timestamp: new Date().toISOString(),
      attributes: { legalBasis: "HIPAA", consentGranted: true, region: "US" }
    }
  })
});
const data = await res.json();`}
            language="typescript"
            filename="authorize.ts"
          />
        </div>

        <div id="sdk-python" className="scroll-mt-20 mt-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Python</h3>
          <CodeBlock 
            code={`import uuid, requests, datetime

payload = {
    "requestId": str(uuid.uuid4()),
    "subject": {"userId": "doctor-1", "role": "DOCTOR", "department": "Cardiology"},
    "resource": {"type": "PatientRecord", "resourceId": "patient-123"},
    "action": "READ",
    "context": {
        "purpose": "treatment",
        "location": "hospital",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "attributes": {"legalBasis": "HIPAA", "consentGranted": True, "region": "US"}
    }
}
r = requests.post("http://localhost:8080/api/v1/authorize", json=payload, timeout=10)
print(r.status_code, r.json())`}
            language="python"
            filename="authorize.py"
          />
        </div>

        <div id="sdk-curl" className="scroll-mt-20 mt-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">cURL</h3>
          <CodeBlock 
            code={`curl -s -X POST http://localhost:8080/api/v1/authorize \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId":"5a1e312f-b1c8-4af8-a6e8-a67bc4a53884",
    "subject":{"userId":"doctor-1","role":"DOCTOR","department":"Cardiology"},
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
        </div>
      </section>

      {/* Error Handling */}
      <section id="error-handling" className="scroll-mt-20 mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">Error Handling</h2>

        <h3 id="error-contract" className="scroll-mt-20 text-xl font-semibold text-foreground mb-4 mt-8">Error Contract (Structured)</h3>
        <p className="text-muted-foreground mb-4">All handled client/server errors return:</p>
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

        <h3 id="status-codes" className="scroll-mt-20 text-xl font-semibold text-foreground mb-4 mt-8">Common Status Codes</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Badge className="bg-green-500/10 text-green-600">200</Badge></TableCell>
              <TableCell>Success</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-yellow-500/10 text-yellow-600">400</Badge></TableCell>
              <TableCell>Malformed JSON or validation error</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-yellow-500/10 text-yellow-600">404</Badge></TableCell>
              <TableCell>Audit record not found</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-orange-500/10 text-orange-600">409</Badge></TableCell>
              <TableCell>Duplicate unique id (requestId or correlationId)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-red-500/10 text-red-600">500</Badge></TableCell>
              <TableCell>Unexpected server error</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="scroll-mt-20 mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">Integration Best Practices</h2>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Generate IDs client-side</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Always create new UUIDs for <code className="rounded bg-muted px-1">requestId</code></li>
                <li>Treat <code className="rounded bg-muted px-1">correlationId</code> as immutable event identity</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Make purpose/context explicit</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Set <code className="rounded bg-muted px-1">context.purpose</code> and compliance attributes</li>
                <li>Include <code className="rounded bg-muted px-1">legalBasis</code>, <code className="rounded bg-muted px-1">consentGranted</code>, <code className="rounded bg-muted px-1">region</code></li>
                <li>This is critical for explainable policy decisions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Store decision artifacts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Persist <code className="rounded bg-muted px-1">evaluationTraceId</code>, <code className="rounded bg-muted px-1">policyVersion</code>, and <code className="rounded bg-muted px-1">evidenceId</code></li>
                <li>These fields enable forensic replay and auditability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">4. Use retry with idempotency discipline</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Network retry is fine, but avoid replaying with same unique IDs</li>
                <li>Expect <code className="rounded bg-muted px-1">409</code> if retrying with same ID</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">5. Choose runtime/storage intentionally</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code className="rounded bg-muted px-1">JSON + DB_ONLY</code> for fast integration</li>
                <li><code className="rounded bg-muted px-1">OPA</code> for advanced policy governance</li>
                <li><code className="rounded bg-muted px-1">BOTH</code> for strongest verifiable audit posture</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-20" />
    </div>
  )
}
