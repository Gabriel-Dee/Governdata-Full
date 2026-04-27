import type { LoginResponse } from "@/lib/api/types"

const STORAGE_KEY = "ehr.session"

export function readSession(): LoginResponse | null {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as LoginResponse
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function writeSession(session: LoginResponse) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function readAccessToken(): string | null {
  return readSession()?.accessToken ?? null
}
