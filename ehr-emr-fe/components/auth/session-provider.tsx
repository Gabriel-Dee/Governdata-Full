"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { login as loginRequest } from "@/lib/api/endpoints"
import type { LoginResponse } from "@/lib/api/types"
import { clearSession, readSession, writeSession } from "@/lib/auth/storage"
import { hasAnyPermission } from "@/lib/rbac"

type SessionContextValue = {
  isReady: boolean
  session: LoginResponse | null
  permissions: string[]
  roles: string[]
  login: (username: string, password: string) => Promise<LoginResponse>
  logout: () => void
  can: (permission: string) => boolean
  canAny: (permissions: string[]) => boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [session, setSession] = useState<LoginResponse | null>(null)

  useEffect(() => {
    setSession(readSession())
    setIsReady(true)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginRequest(username, password)
    writeSession(response)
    setSession(response)
    return response
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo<SessionContextValue>(() => {
    const permissions = session?.permissions ?? []
    const roles = session?.roles ?? []

    return {
      isReady,
      session,
      permissions,
      roles,
      login,
      logout,
      can: (permission: string) => permissions.includes(permission),
      canAny: (required: string[]) => hasAnyPermission(permissions, required),
    }
  }, [isReady, login, logout, session])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return context
}
