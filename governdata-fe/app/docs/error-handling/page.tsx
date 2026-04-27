import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"

export default function ErrorHandlingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        Error Handling
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Structured Error Contract</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        All handled client and server errors return a consistent envelope designed for predictable integration behavior.
      </p>

      <section id="error-contract" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Error Response Envelope</h2>
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
      </section>

      <section id="status-codes" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Common Status Codes</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li><code className="rounded bg-muted px-1 font-mono">200</code> success</li>
          <li><code className="rounded bg-muted px-1 font-mono">400</code> malformed JSON or validation error</li>
          <li>
            <code className="rounded bg-muted px-1 font-mono">401</code> missing or invalid <code className="font-mono">X-API-Key</code> (or invalid admin secret on{" "}
            <code className="font-mono">/api/v1/admin/*</code>) when API key auth is enabled
          </li>
          <li><code className="rounded bg-muted px-1 font-mono">404</code> audit record not found</li>
          <li><code className="rounded bg-muted px-1 font-mono">409</code> duplicate unique id (<code className="font-mono">requestId</code> or <code className="font-mono">correlationId</code>)</li>
          <li><code className="rounded bg-muted px-1 font-mono">500</code> unexpected server error</li>
        </ul>
      </section>

      <section className="rounded-lg border border-border p-6">
        <h3 className="text-xl font-semibold text-foreground mb-3">Conflict Examples</h3>
        <p className="text-muted-foreground mb-2">Duplicate <code className="font-mono">requestId</code>:</p>
        <CodeBlock
          code={`{
  "status":409,
  "error":"Conflict",
  "message":"requestId already exists. Use a new UUID for each authorization request."
}`}
          language="json"
        />
        <p className="text-muted-foreground mt-5 mb-2">Duplicate <code className="font-mono">correlationId</code>:</p>
        <CodeBlock
          code={`{
  "status":409,
  "error":"Conflict",
  "message":"correlationId already exists. Use a unique correlationId for each ingested event."
}`}
          language="json"
        />
      </section>
    </div>
  )
}
