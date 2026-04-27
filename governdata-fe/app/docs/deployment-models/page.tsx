import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function DeploymentModelsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        Deployment Models
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">SaaS, On-prem, and Hybrid</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        Choose deployment based on data residency constraints, compliance posture, and operational ownership.
      </p>

      <section id="model-a" className="mb-10 rounded-lg border border-border p-6 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-3">Model A: Customer-hosted / On-prem</h2>
        <p className="text-muted-foreground mb-4">
          Common for healthcare organizations with strict procurement and data controls.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Governance service runs inside hospital VPC or data center.</li>
          <li>Patient DB and RBAC stay in existing systems.</li>
          <li>Private blockchain runs on customer premises.</li>
          <li>No mandatory provider-side tenant account.</li>
        </ul>
      </section>

      <section id="model-b" className="mb-10 rounded-lg border border-border p-6 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-3">Model B: Managed SaaS</h2>
        <p className="text-muted-foreground mb-4">
          Best for centralized operations and faster upgrades.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Governance service hosted by platform provider.</li>
          <li>Customer systems call endpoints over secure internet/private links.</li>
          <li>Usually requires tenant accounts and API credentials.</li>
          <li>Provider handles patching, upgrades, and monitoring.</li>
        </ul>
      </section>

      <section id="model-c" className="mb-10 rounded-lg border border-border p-6 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-3">Model C: Hybrid</h2>
        <p className="text-muted-foreground mb-4">
          Useful when policy can be centralized but ledger anchoring must remain local.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Policy decision service hosted centrally.</li>
          <li>Audit anchoring connector runs on customer premises.</li>
          <li>Connector writes events to customer private blockchain.</li>
        </ul>
      </section>

      <section className="mb-10 rounded-lg border border-border p-6 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground mb-3">Governance API credentials</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Platform operators use <code className="rounded bg-muted px-1">X-Admin-Secret</code> only on{" "}
          <code className="rounded bg-muted px-1">/api/v1/admin/*</code>. Each customer organization uses{" "}
          <code className="rounded bg-muted px-1">X-API-Key</code> for <code className="rounded bg-muted px-1">/authorize</code>,{" "}
          <code className="rounded bg-muted px-1">/audit/*</code>, <code className="rounded bg-muted px-1">/compliance/*</code>,{" "}
          <code className="rounded bg-muted px-1">/metrics</code>.
        </p>
        <p className="text-sm text-muted-foreground">
          UI and BFF rules:{" "}
          <Link href="/docs/security-auth" className="text-emerald-600 hover:underline">
            Security & authentication
          </Link>
          .
        </p>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6">
        <h3 className="font-semibold text-foreground mb-3">Recommended default for private-chain healthcare</h3>
        <p className="text-sm text-muted-foreground">
          Start with <strong className="text-foreground">Model A (on-prem)</strong>. Keep immutability proofs inside
          customer trust boundaries while preserving the same API contract.
        </p>
      </section>
    </div>
  )
}
