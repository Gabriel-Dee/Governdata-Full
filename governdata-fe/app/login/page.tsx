"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login, hydrated, token } = usePortalAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    setPending(true)
    try {
      await login(email, password)
      toast.success("Signed in")
      router.replace("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-1">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">Use your portal account to manage API keys and snippets.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-6 text-center">
          No account?{" "}
          <Link href="/register" className="text-emerald-600 font-medium hover:underline">
            Create one
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
