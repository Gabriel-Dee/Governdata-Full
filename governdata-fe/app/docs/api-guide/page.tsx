import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const endpointIndex: { method: string; path: string; auth: string }[] = [
  { method: "POST", path: "/api/v1/admin/tenants", auth: "X-Admin-Secret" },
  { method: "GET", path: "/api/v1/admin/tenants", auth: "X-Admin-Secret" },
  { method: "GET", path: "/api/v1/admin/tenants/{tenantId}", auth: "X-Admin-Secret" },
  { method: "POST", path: "/api/v1/admin/api-keys", auth: "X-Admin-Secret" },
  { method: "GET", path: "/actuator/health", auth: "None" },
  { method: "GET", path: "/actuator/info", auth: "None" },
  { method: "POST", path: "/api/v1/authorize", auth: "X-API-Key" },
  { method: "GET", path: "/api/v1/audit/{requestId}", auth: "X-API-Key" },
  { method: "POST", path: "/api/v1/audit/ingest", auth: "X-API-Key" },
  { method: "GET", path: "/api/v1/audit/verify/{correlationId}", auth: "X-API-Key" },
  { method: "GET", path: "/api/v1/metrics", auth: "X-API-Key" },
  { method: "GET", path: "/api/v1/compliance/catalog", auth: "X-API-Key" },
  { method: "POST", path: "/api/v1/compliance/evaluate", auth: "X-API-Key" },
  { method: "POST", path: "/api/v1/benchmark/policy-runtime", auth: "X-API-Key" },
  { method: "POST", path: "/api/v1/auth/register", auth: "None" },
  { method: "POST", path: "/api/v1/auth/login", auth: "None" },
  { method: "GET", path: "/api/v1/portal/me", auth: "Bearer JWT" },
  { method: "GET", path: "/api/v1/portal/api-keys", auth: "Bearer JWT" },
  { method: "POST", path: "/api/v1/portal/api-keys", auth: "Bearer JWT" },
  { method: "DELETE", path: "/api/v1/portal/api-keys/{keyId}", auth: "Bearer JWT" },
  { method: "GET", path: "/api/v1/portal/code-snippets", auth: "Bearer JWT" },
]

export default function ApiGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
        Canonical reference
      </Badge>
      <h1 className="text-4xl font-bold text-foreground mb-6">Developer platform API guide</h1>
      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
        The complete HTTP API reference (every route, auth header, request shape, and copy-paste <code className="rounded bg-muted px-1 text-sm">curl</code> per endpoint) lives in the repository as Markdown. This page summarizes the endpoint index; use the file for full detail.
      </p>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 mb-10">
        <p className="text-sm text-foreground font-medium mb-2">View the full guide</p>
        <a
          href="/developer-platform-api-guide.md"
          className="text-emerald-700 hover:underline text-sm font-mono break-all"
        >
          /developer-platform-api-guide.md
        </a>
        <p className="text-sm text-muted-foreground mt-3">
          Portal UI (register, login, keys, snippets):{" "}
          <Link href="/register" className="text-emerald-600 hover:underline">
            Developer portal
          </Link>{" "}
          and{" "}
          <a href="/frontend-developer-portal-guide.md" className="text-emerald-600 hover:underline">
            frontend-developer-portal-guide.md
          </a>
          . Security rules:{" "}
          <Link href="/docs/security-auth" className="text-emerald-600 hover:underline">
            Security & authentication
          </Link>
          .
        </p>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4">Endpoint index</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Auth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpointIndex.map((row) => (
            <TableRow key={`${row.method}-${row.path}`}>
              <TableCell>
                <code className="text-xs">{row.method}</code>
              </TableCell>
              <TableCell>
                <code className="text-xs">{row.path}</code>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.auth}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="text-sm text-muted-foreground mt-8">
        Routed docs pages in this site mirror <code className="rounded bg-muted px-1">site/*.mdx</code>; this Markdown file remains the canonical REST reference.
      </p>
    </div>
  )
}
