# GovernData Backend (`governdata`)

Spring Boot governance platform backend that authorizes requests, supports JSON/OPA policy runtime, and records audit evidence using DB/Fabric modes.

## Prerequisites

- Java 25+
- Maven 3.9+ (or use `./mvnw`)
- PostgreSQL 15+
- Optional for OPA real-mode: OPA server on `http://localhost:8181`
- Optional for Fabric real-mode: Hyperledger Fabric network + chaincode

## Environment setup

1. Copy template:

```bash
cp .env.example .env
```

2. Minimum required values for local dev:

- `DB_USERNAME`
- `DB_PASSWORD`
- `GOVERNANCE_JWT_SECRET` (use a strong value)

3. Choose runtime/storage mode:

- `GOVERNANCE_POLICY_RUNTIME=JSON` or `OPA`
- `GOVERNANCE_AUDIT_STORAGE=DB_ONLY|BLOCKCHAIN_ONLY|BOTH`
- `GOVERNANCE_BLOCKCHAIN_STUB=true` (fast local) or `false` (real Fabric)

## Run locally

```bash
./mvnw spring-boot:run
```

Default URL: [http://localhost:8080](http://localhost:8080)

Health endpoint:

- `GET /actuator/health`

## Useful dev commands

```bash
./mvnw test
./mvnw flyway:repair
./mvnw flyway:migrate
```

## Run-to-completion paths

### Path A: Fast local validation (stub chain)

1. Set `GOVERNANCE_POLICY_RUNTIME=JSON` (or `OPA` if OPA is running).
2. Set `GOVERNANCE_AUDIT_STORAGE=BOTH`.
3. Set `GOVERNANCE_BLOCKCHAIN_STUB=true`.
4. Start backend and run smoke checks with `scripts/smoke-curl.sh`.

### Path B: Research/defense mode (real OPA + real Fabric)

1. Start PostgreSQL.
2. Start OPA and load policy package.
3. Start Fabric network + governance chaincode.
4. Set `.env` values for `OPA_URL`, `FABRIC_*`, and `GOVERNANCE_BLOCKCHAIN_STUB=false`.
5. Start backend.
6. Run matrix scripts from `../experiment/scripts`.

## Key docs

- `docs/experiment-runbook.md`
- `docs/implementation-opa-real-mode.md`
- `docs/implementation-fabric-real-mode.md`
- `docs/integration-profiles.md`
- `docs/ehr-emr-governance-integration-guide.md`
