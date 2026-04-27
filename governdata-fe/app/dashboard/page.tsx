"use client"

import Link from "next/link"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"
import { Button } from "@/components/ui/button"
import { KeyRound, FileCode2 } from "lucide-react"

export default function DashboardHomePage() {
  const { profile } = usePortalAuth()

  const p = profile as Record<string, unknown> | null
  const tenant = p?.tenant as Record<string, unknown> | undefined
  const user = p?.user as Record<string, unknown> | undefined

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Overview</h1>
      <p className="text-muted-foreground mb-8">
        Manage integration keys and copy curl snippets for your EHR or backend. Runtime calls use{" "}
        <code className="rounded bg-muted px-1 text-sm">X-API-Key</code>, not your portal session.
      </p>

      {(tenant || user) && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 mb-8 text-sm">
          {tenant?.displayName != null && (
            <p>
              <span className="text-muted-foreground">Organization:</span>{" "}
              <span className="font-medium text-foreground">{String(tenant.displayName)}</span>
            </p>
          )}
          {tenant?.tenantKey != null && (
            <p className="mt-1">
              <span className="text-muted-foreground">Tenant key:</span>{" "}
              <code className="text-xs">{String(tenant.tenantKey)}</code>
            </p>
          )}
          {user?.email != null && (
            <p className="mt-1">
              <span className="text-muted-foreground">Signed in as:</span> {String(user.email)}
            </p>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/keys"
          className="rounded-xl border border-border p-6 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors group"
        >
          <KeyRound className="h-8 w-8 text-emerald-600 mb-3" />
          <h2 className="font-semibold text-foreground mb-1 group-hover:text-emerald-700">API keys</h2>
          <p className="text-sm text-muted-foreground">Create and revoke gdk_… keys for your integrations.</p>
        </Link>
        <Link
          href="/dashboard/snippets"
          className="rounded-xl border border-border p-6 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors group"
        >
          <FileCode2 className="h-8 w-8 text-emerald-600 mb-3" />
          <h2 className="font-semibold text-foreground mb-1 group-hover:text-emerald-700">Code snippets</h2>
          <p className="text-sm text-muted-foreground">HIPAA, GDPR, and audit ingest curl examples from your tenant.</p>
        </Link>
      </div>

      <div className="mt-10 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">Integration docs</p>
        <Button variant="outline" asChild>
          <Link href="/docs">Documentation & resources</Link>
        </Button>
      </div>
    </div>
  )
}
