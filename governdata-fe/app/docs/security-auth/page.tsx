import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"

export default function SecurityAuthPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        Security & Authentication
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Authentication model</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        Three surfaces: <strong className="text-foreground">portal JWT</strong> for dashboard and key management, <strong className="text-foreground">X-API-Key</strong> for EHR/runtime integration, and optional{" "}
        <strong className="text-foreground">X-Admin-Secret</strong> for operator provisioning. Details:{" "}
        <a href="/developer-platform-api-guide.md" className="text-emerald-600 hover:underline">
          developer-platform-api-guide.md
        </a>
        .
      </p>

      <section id="current-status" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Current implementation</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Self-service:</strong> <code className="rounded bg-muted px-1">POST /api/v1/auth/register</code> and <code className="rounded bg-muted px-1">POST /api/v1/auth/login</code> return a JWT for{" "}
            <code className="rounded bg-muted px-1">/api/v1/portal/*</code> (me, api-keys, code-snippets).
          </li>
          <li>
            <strong className="text-foreground">Integrations:</strong> tenant-scoped <code className="rounded bg-muted px-1">gdk_…</code> keys via <code className="rounded bg-muted px-1">POST /api/v1/portal/api-keys</code> (Bearer) or operator{" "}
            <code className="rounded bg-muted px-1">POST /api/v1/admin/api-keys</code>; use <code className="rounded bg-muted px-1">X-API-Key</code> on <code className="rounded bg-muted px-1">/authorize</code>, <code className="rounded bg-muted px-1">/audit/*</code>, etc.
          </li>
          <li>
            <strong className="text-foreground">Operator:</strong> <code className="rounded bg-muted px-1">X-Admin-Secret</code> on <code className="rounded bg-muted px-1">/api/v1/admin/*</code> for support and migration.
          </li>
        </ul>
      </section>

      <section id="provisioning-flow" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Provisioning flow (recommended)</h2>
        <ol className="list-decimal pl-5 space-y-2 text-muted-foreground text-sm">
          <li>User registers → receives JWT.</li>
          <li>User creates API key via <code className="rounded bg-muted px-1">POST /api/v1/portal/api-keys</code>.</li>
          <li>EHR stores <code className="rounded bg-muted px-1">gdk_…</code> and calls runtime APIs with <code className="rounded bg-muted px-1">X-API-Key</code>.</li>
        </ol>
      </section>

      <section id="production-contract" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">Production hardening</h2>
        <div className="space-y-6 text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Service-to-service JWT (enterprise)</h3>
            <p className="text-sm">Hospital IdP, gateway validation, tenant claims — often layered with API keys.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">API keys (runtime baseline)</h3>
            <p className="text-sm">Issue per environment; pass <code className="rounded bg-muted px-1">X-API-Key</code>; rotate and scope by tenant.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Portal JWT</h3>
            <p className="text-sm">Signed with server-only <code className="rounded bg-muted px-1">GOVERNANCE_JWT_SECRET</code>; prefer httpOnly cookies or BFF for browser apps.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Mutual TLS</h3>
            <p className="text-sm">Strong for private networks; can pair with JWT or API keys.</p>
          </div>
        </div>
      </section>

      <section id="model-guidance" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">By deployment model</h2>
        <ul className="space-y-3 text-muted-foreground text-sm">
          <li>
            <strong className="text-foreground">Managed SaaS:</strong> typical tenant onboarding + credentials.
          </li>
          <li>
            <strong className="text-foreground">Customer-hosted:</strong> customer may run the stack and manage secrets locally.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-border p-6 bg-muted/30">
        <h3 className="font-semibold text-foreground mb-3">Example headers</h3>
        <CodeBlock
          code={`# EHR / worker
POST /api/v1/authorize
X-API-Key: gdk_xxxxxxxx
Content-Type: application/json

# Portal (after login)
GET /api/v1/portal/api-keys
Authorization: Bearer <accessToken>

# Operator automation only
POST /api/v1/admin/tenants
X-Admin-Secret: <bootstrap-secret>
Content-Type: application/json`}
          language="http"
        />
        <p className="text-sm text-muted-foreground mt-4">
          UI rules:{" "}
          <Link href="/register" className="text-emerald-600 hover:underline">
            Developer portal
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
