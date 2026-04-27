"use client"

import { useCallback, useEffect, useState } from "react"
import { getCodeSnippets, type CodeSnippetsResponse, type SnippetBlock } from "@/lib/governance-api"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Copy } from "lucide-react"

function SnippetCard({
  title,
  block,
  placeholder,
}: {
  title: string
  block: SnippetBlock | undefined
  placeholder?: string
}) {
  const curl = block?.curl?.trim() || placeholder || ""

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">{block?.title ?? title}</h2>
          {block?.description && <p className="text-sm text-muted-foreground mt-1">{block.description}</p>}
        </div>
        {curl && (
          <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(curl).then(() => toast.success("Copied"))}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy
          </Button>
        )}
      </div>
      <pre className="p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words bg-muted/20 font-mono leading-relaxed">
        {curl || "No snippet returned from the API for this block."}
      </pre>
    </div>
  )
}

export default function DashboardSnippetsPage() {
  const { token } = usePortalAuth()
  const [data, setData] = useState<CodeSnippetsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await getCodeSnippets(token)
      setData(res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load snippets")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const base = data?.publicBaseUrl
  const ph = data?.apiKeyPlaceholder

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Code snippets</h1>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        Tenant-scoped curl examples for policy and audit integration. Replace{" "}
        {ph ? (
          <code className="rounded bg-muted px-1 text-sm">{ph}</code>
        ) : (
          <code className="rounded bg-muted px-1 text-sm">YOUR_API_KEY</code>
        )}{" "}
        with a key from{" "}
        <a href="/dashboard/keys" className="text-emerald-600 font-medium hover:underline">
          API keys
        </a>
        .
      </p>

      {base && (
        <p className="text-sm text-muted-foreground mb-8">
          Base URL: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{base}</code>
        </p>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading snippets…</p>
      ) : (
        <div className="space-y-8">
          <SnippetCard title="HIPAA" block={data?.policyHipaa} />
          <SnippetCard title="GDPR" block={data?.policyGdpr} />
          <SnippetCard title="Audit ingest" block={data?.auditIngest} />
        </div>
      )}
    </div>
  )
}
