# Open Policy Agent (OPA) — real-mode implementation

This document describes **how OPA is integrated** into GovernData for research and production-style evaluation: Rego policy location, how the Java service calls OPA, environment variables, and how to verify you are **not** using JSON fallback.

---

## 1. Role of OPA in GovernData

- Policy evaluation is triggered from `POST /api/v1/authorize`.
- The active runtime is selected with `governance.policy.runtime` (`JSON` or `OPA`).
- When `OPA` is selected, `OpaPolicyRuntime` sends an HTTP **POST** to the OPA REST API with a JSON body `{ "input": { ... } }`.
- The **input** includes `context` (from the authorization request), plus `policyContent`, `policyVersionId`, and `policyVersionHash` for traceability.

Implementation: `governdata/src/main/java/com/governdata/governdata/policy/runtime/opa/OpaPolicyRuntime.java`.

---

## 2. Rego policy in this repository

- **File**: `governdata/opa/healthcare_authz.rego`
- **Package**: `healthcare.authz`
- **Decision document**: `data.healthcare.authz.result` — an object `{ "allow": bool, "reason": string }` (see file for exact rules).

Rules implemented for the research scenarios:

- Allow: clinician + same department + HIPAA treatment or GDPR consent context.
- Deny: cross-department access (doctor vs `recordDepartment`).
- Deny: research role without valid GDPR consent context.

---

## 3. OPA server command

Start OPA with the policy file loaded:

```bash
opa run --server --addr :8181 /path/to/governdata/opa/healthcare_authz.rego
```

Verify:

```bash
curl -s http://localhost:8181/v1/data/healthcare/authz/result | head
```

---

## 4. URL path the Java client must use

The Java code posts to `governance.policy.opa.url` (default `http://localhost:8181/v1/data/healthcare/authz`).

**Important**: The default path points at the **package** `healthcare.authz`. If your Rego exposes a **rule** `result` (object), you should set the URL to the **document** for that rule:

```text
http://localhost:8181/v1/data/healthcare/authz/result
```

That way OPA returns a JSON value that maps cleanly to allow/deny + reason in `OpaPolicyRuntime`.

Environment variable (relaxed binding):

```bash
export GOVERNANCE_POLICY_OPA_URL=http://localhost:8181/v1/data/healthcare/authz/result
```

---

## 5. Disabling JSON fallback (required for “real OPA” experiments)

Property:

```text
governance.policy.opa.fallback-json-on-error=false
```

Environment:

```bash
export GOVERNANCE_POLICY_OPA_FALLBACK_JSON_ON_ERROR=false
```

Also set:

```bash
export GOVERNANCE_POLICY_OPA_FAIL_OPEN=false
```

If OPA is unreachable and fallback is **false**, the service returns **DENY** with an OPA error reason (no silent JSON substitution).

Default in code was updated to `false` for strict experiments.

---

## 6. How to confirm runtime in responses

Successful `POST /api/v1/authorize` responses include:

- `"runtimeUsed": "OPA"`
- `"reason": "..."` from Rego when using the `/result` document

If you ever see `OPA_FALLBACK_JSON`, fallback was active — fix OPA URL and fallback settings.

---

## 7. Relation to the JSON engine

- `JsonPolicyRuntime` evaluates the tenant’s stored JSON policy packs from the database.
- `OpaPolicyRuntime` does **not** use that JSON for decisions when OPA succeeds; it only uses `policyContent` in the payload for advanced scenarios.
- With **fallback disabled**, OPA failures do not silently re-use JSON semantics.

---

## 8. Presentation / thesis bullets

- OPA runs as a **separate process**; GovernData is a **client** of the OPA REST API.
- Policies are **versionable** as code (`healthcare_authz.rego`) independent of DB migrations.
- **No PHI** is sent to OPA beyond what you place in `context` (design `AuthorizationRequest` accordingly).

---

## 9. References

- OPA docs: [https://www.openpolicyagent.org/docs/latest/rest-api/](https://www.openpolicyagent.org/docs/latest/rest-api/)
- Rego: [https://www.openpolicyagent.org/docs/latest/policy-language/](https://www.openpolicyagent.org/docs/latest/policy-language/)
