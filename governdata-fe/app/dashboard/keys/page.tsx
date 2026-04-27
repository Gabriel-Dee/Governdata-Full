"use client"

import { useCallback, useEffect, useState } from "react"
import {
  deletePortalApiKey,
  getPortalApiKeys,
  postPortalApiKey,
  type ApiKeyRow,
} from "@/lib/governance-api"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Copy, Trash2, Plus } from "lucide-react"

function keyRowId(row: ApiKeyRow): number | undefined {
  const n = row.id ?? row.keyId
  return typeof n === "number" ? n : undefined
}

export default function DashboardKeysPage() {
  const { token } = usePortalAuth()
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [reveal, setReveal] = useState<{ raw: string; name: string } | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await getPortalApiKeys(token)
      setKeys(list)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load keys")
      setKeys([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !newName.trim()) return
    setCreating(true)
    try {
      const res = await postPortalApiKey(token, newName.trim())
      const raw = res.apiKey
      if (raw) {
        setReveal({ raw, name: newName.trim() })
      } else {
        toast.success("Key created")
      }
      setCreateOpen(false)
      setNewName("")
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key")
    } finally {
      setCreating(false)
    }
  }

  async function onRevoke(row: ApiKeyRow) {
    const id = keyRowId(row)
    if (!token || id == null) {
      toast.error("Cannot revoke this key (missing id)")
      return
    }
    if (!confirm("Revoke this API key? Integrations using it will stop working.")) return
    try {
      await deletePortalApiKey(token, id)
      toast.success("Key revoked")
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revoke failed")
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text)
    toast.success("Copied")
  }

  const prefix = (row: ApiKeyRow) => row.keyPrefix ?? row.prefix ?? "—"

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">API keys</h1>
          <p className="text-muted-foreground text-sm">
            Use these keys as <code className="rounded bg-muted px-1">X-API-Key</code> for runtime authorize, audit, and
            compliance calls. The full secret is only shown once when created.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create key
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left font-medium p-3">Name</th>
              <th className="text-left font-medium p-3">Prefix</th>
              <th className="text-left font-medium p-3">Created</th>
              <th className="text-right font-medium p-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No keys yet. Create one for your integration.
                </td>
              </tr>
            ) : (
              keys.map((row, i) => (
                <tr key={keyRowId(row) ?? i} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{row.name ?? "—"}</td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{prefix(row)}</code>
                  </td>
                  <td className="p-3 text-muted-foreground">{row.createdAt ?? "—"}</td>
                  <td className="p-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onRevoke(row)}
                      aria-label="Revoke key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={onCreate}>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Choose a label for this key (for example: production EHR worker).</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="keyName">Name</Label>
              <Input
                id="keyName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. staging-integration"
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={creating}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reveal} onOpenChange={(o) => !o && setReveal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Copy your API key</DialogTitle>
            <DialogDescription>
              This is the only time the full secret is shown. Store it in a secret manager — not in source control.
            </DialogDescription>
          </DialogHeader>
          {reveal && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Key: <span className="font-medium text-foreground">{reveal.name}</span>
              </p>
              <div className="flex gap-2">
                <code className="flex-1 break-all rounded-lg bg-muted p-3 text-xs">{reveal.raw}</code>
                <Button type="button" variant="outline" size="icon" onClick={() => copy(reveal.raw)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setReveal(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
