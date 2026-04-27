"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = usePortalAuth()
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return
    if (!token) router.replace("/login")
  }, [hydrated, token, router])

  if (!hydrated) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    )
  }

  if (!token) return null

  return <>{children}</>
}
