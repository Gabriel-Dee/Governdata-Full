/** Browser + server: Governance Platform API base URL. */
export function getGovernanceApiUrl(): string {
  return (
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_GOVERNANCE_API_URL) ||
    "http://localhost:8080"
  ).replace(/\/$/, "")
}

export type RegisterBody = {
  email: string
  password: string
  organizationDisplayName: string
  tenantKey?: string
  displayName?: string
}

export type AuthResponse = {
  accessToken: string
  tokenType?: string
  expiresInSeconds?: number
  tenant?: unknown
  user?: unknown
}

export async function postRegister(body: RegisterBody): Promise<AuthResponse> {
  const res = await fetch(`${getGovernanceApiUrl()}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || res.statusText || "Registration failed")
  }
  return res.json()
}

export async function postLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${getGovernanceApiUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || res.statusText || "Login failed")
  }
  return res.json()
}

export async function getPortalMe(token: string): Promise<unknown> {
  const res = await fetch(`${getGovernanceApiUrl()}/api/v1/portal/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to load profile")
  return res.json()
}

export type ApiKeyRow = {
  id?: number
  keyId?: number
  name?: string
  keyPrefix?: string
  prefix?: string
  active?: boolean
  createdAt?: string
}

export async function getPortalApiKeys(token: string): Promise<ApiKeyRow[]> {
  const res = await fetch(`${getGovernanceApiUrl()}/api/v1/portal/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to list API keys")
  const data = await res.json()
  return Array.isArray(data) ? data : data.keys ?? data.items ?? []
}

export type CreateKeyResponse = {
  apiKey?: string
  keyPrefix?: string
  prefix?: string
  name?: string
  tenantId?: number
}

export async function postPortalApiKey(token: string, name: string): Promise<CreateKeyResponse> {
  const res = await fetch(`${getGovernanceApiUrl()}/api/v1/portal/api-keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || "Failed to create API key")
  }
  return res.json()
}

export async function deletePortalApiKey(token: string, keyId: number): Promise<void> {
  const res = await fetch(`${getGovernanceApiUrl()}/api/v1/portal/api-keys/${keyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to revoke key")
}

export type SnippetBlock = {
  id?: string
  title?: string
  description?: string
  curl?: string
}

export type CodeSnippetsResponse = {
  publicBaseUrl?: string
  apiKeyPlaceholder?: string
  policyHipaa?: SnippetBlock
  policyGdpr?: SnippetBlock
  auditIngest?: SnippetBlock
}

export async function getCodeSnippets(token: string): Promise<CodeSnippetsResponse> {
  const res = await fetch(`${getGovernanceApiUrl()}/api/v1/portal/code-snippets`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to load code snippets")
  return res.json()
}
