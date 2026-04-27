# Hospital / EHR journey (layman): accounts, API keys, HIPAA & GDPR, docs map

This document explains **who does what**, **what is not built yet**, and **where to read** in this repo so a hospital (or their vendor) can integrate **policy enforcement** and **immutable audit anchoring**.

---

## 1. Two kinds of “people” (and two kinds of secrets)

| Role | Who they are | What they use | What they never get |
|------|----------------|----------------|------------------------|
| **Platform operator** (“system admin” **on your side**) | Your team: onboarding, support, monitoring usage via **`/api/v1/metrics`**, listing orgs via **`GET /api/v1/admin/tenants`**, issuing keys | **`X-Admin-Secret`** on **`/api/v1/admin/*`** only | — |
| **Customer organization** | Hospital / vendor integrating the **EHR backend** to this service | **`X-API-Key`** (`gdk_…`) on **`/authorize`**, **`/audit/*`**, **`/compliance/*`**, **`/metrics`**; portal users use **JWT** on **`/api/v1/portal/*`** to create those keys | They do **not** need the admin secret for self-service. End-users (clinicians) never call this API directly. |

**Self-service (API today):** `POST /api/v1/auth/register` creates the **tenant** and the **first portal user** (email + password) and returns a **JWT**. The user then calls **`POST /api/v1/portal/api-keys`** with **`Authorization: Bearer`** to mint **`gdk_…`** keys for EHR integration—**no `X-Admin-Secret`**. Optional operator path: **`POST /api/v1/admin/tenants`** still exists for internal provisioning. See **`docs/frontend-developer-portal-guide.md`** and **`docs/site/platform-roles-and-frontend.mdx`**.

---

## 2. End-to-end story (happy path)

1. **Hospital decides** they want governance policy checks before sensitive reads/writes and want **tamper-evident audit evidence** from this platform (often in addition to their own EMR audit table).

2. **Your commercial / ops process** (outside this repo): contract, BAA as needed, technical contact.

3. **Account + key setup** (pick one):
   - **Self-service:** **`POST /api/v1/auth/register`** → **`POST /api/v1/portal/api-keys`** (Bearer JWT) to obtain at least one **`gdk_…`** key (e.g. `name: "ehr-production"`).
   - **Operator (optional):** someone with **`GOVERNANCE_ADMIN_SECRET`** uses **`POST /api/v1/admin/tenants`** and **`POST /api/v1/admin/api-keys`** as before.

4. **Hospital IT / integrator** stores the key in **their** secret store and configures the EHR backend:
   - **`X-API-Key: <gdk_…>`** on every call to the governance runtime APIs.

5. **EHR runtime behavior** (conceptual):
   - User passes **local RBAC** (your JWT / roles).
   - Before PHI access, EHR calls **`POST /api/v1/authorize`** with **purpose**, **resource**, **action**, and **attributes** (HIPAA/GDPR-oriented fields like `legalBasis`, `region`, `consentGranted`, etc.).
   - If **ALLOW**, proceed; if **DENY**, block.
   - After the action, EHR may call **`POST /api/v1/audit/ingest`** with a **unique `correlationId`** and optional metadata; then **`GET /api/v1/audit/verify/{correlationId}`** when you need to prove integrity.

6. **HIPAA + GDPR “both”** in this platform:
   - **Policy enforcement** = rules in the **policy JSON** (and your **active** `governance.default-policy`) + what you send on **`/authorize`**.
   - **Compliance catalog** = **`GET /api/v1/compliance/catalog`** and **`POST /api/v1/compliance/evaluate`** with evidence flags (organizational / technical attestations), separate from a single patient read.

---

## 3. “Governance admin monitoring organizations” — what exists now

- **Platform operator** uses the **same** **`X-Admin-Secret`** to:
  - **`GET /api/v1/admin/tenants`** — list organizations.
  - **`GET /api/v1/admin/tenants/{tenantId}`** — detail + **non-secret** API key metadata (prefixes, names, active).

- There is **no separate login database** for “super admins” vs “org admins” in v1: **one admin secret** is the **bootstrap / ops** credential. Splitting **multiple platform admins** with audit trails would be a **future** product (SSO, RBAC for `/admin`, etc.).

---

## 4. Docs site map (what to read for what)

| Goal | Where |
|------|--------|
| **Roles, frontend/BFF, admin vs tenant APIs** | **`docs/site/platform-roles-and-frontend.mdx`** (`/platform-roles-and-frontend`) |
| Big picture + first curls | **`docs/site/getting-started.mdx`** (published route `/getting-started`) |
| Spring Boot integration pattern | **`docs/site/integration/spring-boot.mdx`** (`/integration/spring-boot`) |
| Authorize contract | **`docs/site/reference/authorize.mdx`** (`/reference/authorize`) |
| Audit ingest / verify | **`docs/site/reference/audit-ingest.mdx`** (`/reference/audit-ingest`) |
| Full endpoint list & auth model | **`docs/developer-platform-api-guide.md`** |
| EHR-specific gates + mapping local audit | **`docs/ehr-emr-governance-integration-guide.md`** |
| Fabric network (real chain) | **`fabric/README.md`** |

---

## 5. Endpoint cheat sheet (integration-facing)

| Step | Method | Path | Auth |
|------|--------|------|------|
| Health | GET | `/actuator/health` | None |
| Register org (operator) | POST | `/api/v1/admin/tenants` | `X-Admin-Secret` |
| List orgs (operator) | GET | `/api/v1/admin/tenants` | `X-Admin-Secret` |
| Org detail (operator) | GET | `/api/v1/admin/tenants/{tenantId}` | `X-Admin-Secret` |
| Issue key (operator) | POST | `/api/v1/admin/api-keys` | `X-Admin-Secret` |
| Policy decision | POST | `/api/v1/authorize` | `X-API-Key` |
| Compliance catalog | GET | `/api/v1/compliance/catalog` | `X-API-Key` |
| Compliance evaluate | POST | `/api/v1/compliance/evaluate` | `X-API-Key` |
| Audit ingest | POST | `/api/v1/audit/ingest` | `X-API-Key` |
| Audit verify | GET | `/api/v1/audit/verify/{correlationId}` | `X-API-Key` |
| Metrics | GET | `/api/v1/metrics` | `X-API-Key` |

---

## 6. Honest scope

- **Organizations “having an account”** = **a tenant row + valid API key(s)** in **this** database — not a consumer login product yet.
- **Endpoint protection** = **`X-API-Key`** for tenant APIs; **`X-Admin-Secret`** for provisioning; rotate secrets in production and restrict admin access to break-glass / automation.
