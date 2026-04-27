"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/components/auth/session-provider"
import { defaultLandingPath, hasAnyPermission, requiredPermissionsForPath } from "@/lib/rbac"
import { AuthGateSkeleton } from "@/components/loading/page-skeletons"

type Props = {
  children: React.ReactNode
  requiredAny?: string[]
}

export function RequireAuth({ children, requiredAny }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { isReady, session, permissions } = useSession()

  const pathPermissions = requiredAny ?? requiredPermissionsForPath(pathname)
  const isAllowed = !pathPermissions || hasAnyPermission(permissions, pathPermissions)

  useEffect(() => {
    if (!isReady) return

    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (!isAllowed) {
      router.replace(defaultLandingPath(permissions))
    }
  }, [isAllowed, isReady, pathname, permissions, router, session])

  if (!isReady || !session || !isAllowed) {
    return <AuthGateSkeleton />
  }

  return <>{children}</>
}
