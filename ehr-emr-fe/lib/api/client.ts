import { clearSession, readAccessToken } from "@/lib/auth/storage"
import type { ErrorResponse } from "@/lib/api/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

type RequestOptions = RequestInit & {
  requiresAuth?: boolean
}

export class ApiError extends Error {
  status: number
  details?: ErrorResponse

  constructor(status: number, message: string, details?: ErrorResponse) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers, ...rest } = options
  const token = readAccessToken()
  const requestHeaders = new Headers(headers ?? {})

  if (!requestHeaders.has("Content-Type") && rest.body) {
    requestHeaders.set("Content-Type", "application/json")
  }

  if (requiresAuth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    ...rest,
    headers: requestHeaders,
  })

  if (!response.ok) {
    let details: ErrorResponse | undefined

    try {
      details = (await response.json()) as ErrorResponse
    } catch {
      details = undefined
    }

    if (response.status === 401) {
      clearSession()
    }

    throw new ApiError(response.status, details?.message ?? "Request failed", details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
