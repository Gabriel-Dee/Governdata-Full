"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePortalAuth } from "@/components/providers/portal-auth-provider"

export function PortalHeaderAuth() {
  const { token, hydrated, logout } = usePortalAuth()
  const pathname = usePathname()
  const onDashboard = pathname.startsWith("/dashboard")

  if (!hydrated) {
    return <div className="h-9 w-[168px] shrink-0" aria-hidden />
  }

  if (token) {
    return (
      <div className="flex items-center gap-2">
        {!onDashboard && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Log in</Link>
      </Button>
      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
        <Link href="/register">Register</Link>
      </Button>
    </div>
  )
}
