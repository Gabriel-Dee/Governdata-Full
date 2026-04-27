"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { getPortalMe, postLogin, postRegister, type RegisterBody } from "@/lib/governance-api"

const STORAGE_KEY = "governance_portal_access_token"

type PortalAuthState = {
  token: string | null
  hydrated: boolean
  profile: unknown | null
  refreshProfile: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (body: RegisterBody) => Promise<void>
  logout: () => void
}

const PortalAuthContext = createContext<PortalAuthState | null>(null)

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [profile, setProfile] = useState<unknown | null>(null)

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(STORAGE_KEY)
      setToken(t)
    } catch {
      setToken(null)
    }
    setHydrated(true)
  }, [])

  const persistToken = useCallback((t: string | null) => {
    setToken(t)
    try {
      if (t) sessionStorage.setItem(STORAGE_KEY, t)
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setProfile(null)
      return
    }
    try {
      const me = await getPortalMe(token)
      setProfile(me)
    } catch {
      setProfile(null)
    }
  }, [token])

  useEffect(() => {
    if (!hydrated || !token) {
      setProfile(null)
      return
    }
    void refreshProfile()
  }, [hydrated, token, refreshProfile])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await postLogin(email, password)
      persistToken(data.accessToken)
    },
    [persistToken]
  )

  const register = useCallback(
    async (body: RegisterBody) => {
      const data = await postRegister(body)
      persistToken(data.accessToken)
    },
    [persistToken]
  )

  const logout = useCallback(() => {
    persistToken(null)
    setProfile(null)
  }, [persistToken])

  const value = useMemo(
    () => ({
      token,
      hydrated,
      profile,
      refreshProfile,
      login,
      register,
      logout,
    }),
    [token, hydrated, profile, refreshProfile, login, register, logout]
  )

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) throw new Error("usePortalAuth must be used within PortalAuthProvider")
  return ctx
}
