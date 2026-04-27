"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/components/auth/session-provider"
import { defaultLandingPath } from "@/lib/rbac"

export default function Home() {
  const router = useRouter()
  const { isReady, session, permissions } = useSession()

  useEffect(() => {
    if (!isReady) return
    if (!session) {
      router.replace("/login")
      return
    }
    router.replace(defaultLandingPath(permissions))
  }, [isReady, permissions, router, session])

  return (
    <div className="min-h-screen bg-[#E8EDFB] flex items-center justify-center text-[#1F1F1F]">
      Redirecting...
    </div>
  )
}
