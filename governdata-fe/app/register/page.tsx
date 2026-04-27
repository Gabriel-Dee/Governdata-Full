"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { register, hydrated, token } = usePortalAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [organizationDisplayName, setOrganizationDisplayName] = useState("")
  const [tenantKey, setTenantKey] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!hydrated || !token) return
    router.replace("/dashboard")
  }, [hydrated, token, router])

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm bg-muted/30">
        Loading…
      </div>
    )
  }

  if (token) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm bg-muted/30">
        Redirecting…
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setPending(true)
    try {
      await register({
        email,
        password,
        organizationDisplayName,
        tenantKey: tenantKey.trim() || undefined,
        displayName: displayName.trim() || undefined,
      })
      toast.success("Account created")
      router.replace("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Register your organization and get API keys for integrations.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org">Organization name</Label>
            <Input
              id="org"
              required
              placeholder="Acme Hospital"
              value={organizationDisplayName}
              onChange={(e) => setOrganizationDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantKey">Org slug (optional)</Label>
            <Input
              id="tenantKey"
              placeholder="acme-hospital"
              value={tenantKey}
              onChange={(e) => setTenantKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            />
            <p className="text-xs text-muted-foreground">Lowercase letters, numbers, hyphens. Leave blank to auto-generate.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Your name (optional)</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          <Link href="/docs" className="hover:underline">
            Documentation
          </Link>
        </p>
      </div>
    </div>
  )
}
