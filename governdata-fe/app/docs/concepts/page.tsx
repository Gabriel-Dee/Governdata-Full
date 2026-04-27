import { CodeBlock } from "@/components/code-block"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ConceptsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        Core Concepts
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Understanding the Platform</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        Before integrating, understand the three core concepts: policy enforcement runtime, 
        audit storage modes, and ID uniqueness requirements.
      </p>

      {/* Policy Runtime */}
      <section id="policy-runtime" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Policy Enforcement Runtime</h2>
        <p className="text-muted-foreground mb-6">
          Requests are evaluated by the <code className="rounded bg-muted px-1 font-mono">POLICY_CODE</code> engine using one of two runtimes:
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">JSON Runtime (default)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Evaluates JSON DSL policies stored in the database. Best for simple, declarative rules.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">OPA Runtime</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Delegates decisions to OPA/Rego endpoint. Best for complex policy logic.
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground mb-3">Configure via environment variables:</p>
        <CodeBlock 
          code={`GOVERNANCE_POLICY_RUNTIME=JSON|OPA
OPA_URL=<required when OPA>
GOVERNANCE_AUTH_API_KEY_ENABLED=true`}
          language="bash"
        />
      </section>

      {/* Audit Storage */}
      <section id="audit-storage" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Audit Storage Mode</h2>
        <p className="text-muted-foreground mb-6">
          Configure via <code className="rounded bg-muted px-1 font-mono">GOVERNANCE_AUDIT_STORAGE</code> environment variable:
        </p>
        
        <p className="text-sm text-muted-foreground mb-4">
          Default in server config is typically <code className="rounded bg-muted px-1 font-mono">BOTH</code>. Use{" "}
          <code className="rounded bg-muted px-1 font-mono">GOVERNANCE_BLOCKCHAIN_STUB=true</code> for local dev without Hyperledger (synthetic{" "}
          <code className="rounded bg-muted px-1 font-mono">stub-tx-*</code> evidence ids); set <code className="rounded bg-muted px-1 font-mono">false</code> and configure Fabric for a real network.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mode</TableHead>
              <TableHead>Behavior</TableHead>
              <TableHead>Use Case</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code className="rounded bg-muted px-1 font-mono">DB_ONLY</code></TableCell>
              <TableCell>Governance stores the audit ingest row in Postgres only (no chain step)</TableCell>
              <TableCell>Skip chain when intentional</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="rounded bg-muted px-1 font-mono">BLOCKCHAIN_ONLY</code></TableCell>
              <TableCell>Submit to Fabric when stub is off; metadata may still be stored for verify</TableCell>
              <TableCell>Chain-focused deployments</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code className="rounded bg-muted px-1 font-mono">BOTH</code></TableCell>
              <TableCell>DB index + on-chain or stub anchor (default emphasis for demos)</TableCell>
              <TableCell>Strong verifiable audit posture</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p className="text-sm text-muted-foreground mt-4">
          A governance metadata row is stored so <code className="rounded bg-muted px-1 font-mono">GET /audit/verify</code> can resolve the event — this is not your EMR’s clinical audit table.
        </p>
      </section>

      {/* IDs and Uniqueness */}
      <section id="ids-uniqueness" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">IDs and Uniqueness</h2>
        <p className="text-muted-foreground mb-6">
          The platform enforces strict uniqueness on certain IDs to ensure audit integrity:
        </p>
        
        <ul className="space-y-4 text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <div>
              <code className="rounded bg-muted px-1 font-mono">requestId</code> for <code className="rounded bg-muted px-1 font-mono">/authorize</code> must be unique per request
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <div>
              <code className="rounded bg-muted px-1 font-mono">correlationId</code> for <code className="rounded bg-muted px-1 font-mono">/audit/ingest</code> must be unique per event
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
            <div>
              Duplicates return <Badge variant="destructive">409 Conflict</Badge> with a clear error message
            </div>
          </li>
        </ul>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Always generate UUIDs client-side. Treat <code className="font-mono">correlationId</code> as immutable event identity.
          </p>
        </div>
      </section>

      {/* Best Practices Summary */}
      <section id="best-practices" className="rounded-xl border border-border p-6 bg-muted/30 scroll-mt-24">
        <h3 className="font-semibold text-foreground mb-4">Integration Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm mb-5">
          <div>
            <p className="font-medium text-foreground mb-1">For Development</p>
            <p className="text-muted-foreground">Use <code className="font-mono">JSON</code> policies + <code className="font-mono">DB_ONLY</code> or stub chain for fast iteration</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">For production</p>
            <p className="text-muted-foreground">Use <code className="font-mono">OPA</code> when needed + <code className="font-mono">BOTH</code> with real Fabric when immutability matters</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Persist <code className="font-mono">evaluationTraceId</code>, <code className="font-mono">policyVersion</code>, and <code className="font-mono">evidenceId</code> for compliance audits.</li>
          <li>Retry network failures carefully and avoid replaying the same unique IDs unless you expect <code className="font-mono">409 Conflict</code>.</li>
          <li>Make <code className="font-mono">context.purpose</code> and legal attributes explicit for explainable policy decisions.</li>
        </ul>
      </section>
    </div>
  )
}
