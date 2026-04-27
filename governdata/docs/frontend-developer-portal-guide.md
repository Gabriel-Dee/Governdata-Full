# Frontend developer portal guide (self-service)

This guide is for building the **web UI** that mirrors a **Groq-style** developer experience: **sign up**, **log in**, **API keys**, and **code snippets** for your Governance-as-a-Service product. It complements the canonical REST reference in **`developer-platform-api-guide.md`** (which stays the full endpoint list).

## Product shape

| Area | User sees | Backend calls |
|------|-----------|----------------|
| Registration | Org name, email, password, optional org slug (`tenantKey`) | `POST /api/v1/auth/register` |
| Login | Email, password | `POST /api/v1/auth/login` |
| Session | Dashboard routes | `Authorization: Bearer <jwt>` |
| API keys | List (prefix only), create (show full key once), revoke | `GET/POST/DELETE /api/v1/portal/api-keys` |
| Snippets | Tabs: HIPAA policy, GDPR policy, audit ingest | `GET /api/v1/portal/code-snippets` then render `curl` fields |
| Profile | Org name, user email | `GET /api/v1/portal/me` |

**Integrations (EHR, BFF, workers)** use **`X-API-Key: gdk_…`** on **`/api/v1/authorize`**, **`/api/v1/audit/*`**, etc. They **do not** use the portal JWT.

## Auth token handling (browser)

- **Prefer** storing the JWT in an **httpOnly, Secure, SameSite** cookie set by your **BFF**, or keep it **only in memory** for SPA-only demos.
- **Do not** put **`GOVERNANCE_JWT_SECRET`**, **`GOVERNANCE_ADMIN_SECRET`**, or raw **`gdk_…`** keys in public `NEXT_PUBLIC_*` / client bundles.
- Send portal requests as: `Authorization: Bearer <accessToken>` from register/login response.

## Suggested pages

1. **`/register`** — form → `POST /api/v1/auth/register` → persist session → redirect to dashboard.
2. **`/login`** — form → `POST /api/v1/auth/login` → session → dashboard.
3. **`/dashboard`** (or `/settings/api-keys`) — list keys, button “Create key”, modal showing **full key once** with copy button; list rows show **prefix** only after that.
4. **`/docs/snippets`** or embedded panel — `GET /api/v1/portal/code-snippets` — three cards:
   - **Policy — HIPAA** (`policyHipaa.curl`)
   - **Policy — GDPR** (`policyGdpr.curl`)
   - **Audit / immutable log** (`auditIngest.curl`)
   - Replace `YOUR_API_KEY` in the UI with the user’s newly created key (user paste), or inject from a “selected key” dropdown if you store only the key client-side during the session (avoid persisting raw keys in `localStorage`).

## Environment variables (frontend repo)

Typical **public** values only:

- `NEXT_PUBLIC_GOVERNANCE_API_URL` — your API base (e.g. `https://api.yourcompany.com`).

Server-side (BFF) or deployment secrets:

- `GOVERNANCE_API_URL` — same base for server-side proxy if used.

Do **not** expose JWT signing secrets to the frontend.

## Operator-only admin API (optional)

Listing **all** tenants and issuing keys by **`tenantId`** remains on **`/api/v1/admin/*`** with **`X-Admin-Secret`**. Use from **internal tools** only, not the customer dashboard.

## Related docs

- **`docs/developer-platform-api-guide.md`** — every route + `curl`.
- **`docs/site/platform-roles-and-frontend.mdx`** — roles and security rules for the docs site.
- **`docs/site/getting-started.mdx`** — quick start (updated for self-service).
