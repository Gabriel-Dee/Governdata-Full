# GovernData Research Project (Information Assurance)

This repository contains the full implementation and experimentation workspace for a graduate-level Information Assurance research project focused on **health data governance**.

At a high level, the project demonstrates how access to electronic health records can be controlled and audited using:

- traditional application/database enforcement,
- external policy evaluation (OPA),
- and blockchain-backed governance/audit mechanisms (Hyperledger Fabric),

and then compares these approaches using reproducible experiments.

## Research Objective

The core question addressed by this project is:

How do different governance enforcement architectures affect security, auditability, and performance in a healthcare data system?

The system evaluates multiple governance modes (DB-only, OPA-based, blockchain-integrated, and hybrid variants) using synthetic EHR/EMR workflows and benchmark scripts.

## End-to-End System Overview

The workspace is organized as a multi-module system:

1. **Clinical application layer** (EHR/EMR frontend + backend) where users access patient data.
2. **Governance platform layer** that authorizes access requests and records policy/audit outcomes.
3. **Developer portal/UI layer** for governance APIs and platform onboarding/documentation.
4. **Experimentation layer** that runs controlled scenarios and captures measurements/results.

In normal operation:

- users interact with an EHR/EMR UI,
- the EHR backend handles business/data logic,
- the EHR backend calls the governance platform for protected operations,
- governance decisions and audit events are recorded according to the selected enforcement mode,
- experiment scripts automate repeated runs and compare outcomes.

## Repository Structure and Folder Responsibilities

There are five primary folders in this repository:

### `ehr-emr-be`

Spring Boot backend for the demo EHR/EMR system (clinical system of record).

Main responsibilities:

- exposes patient, encounter, diagnosis, and medication APIs,
- provides authentication/JWT and RBAC checks,
- stores and serves synthetic healthcare data (PostgreSQL),
- calls the governance platform before allowing protected access,
- records local audit events for baseline comparison.

This module represents the operational healthcare backend whose requests are subject to governance decisions.

### `ehr-emr-fe`

Next.js frontend for the EHR/EMR workflow (clinician/operator-facing app).

Main responsibilities:

- user login and session handling,
- clinical dashboards and views (patients, encounters, diagnoses, medications),
- admin/import and analytics pages for demo/research workflows,
- frontend integration with EHR backend endpoints.

This module is the user-facing interface for the clinical side of the experiment.

### `governdata`

Spring Boot governance platform backend (policy decision and governance orchestration service).

Main responsibilities:

- receives authorization requests from the EHR backend,
- enforces policy logic and governance rules,
- integrates with OPA and/or Hyperledger Fabric paths depending on configuration,
- maintains governance metadata, APIs, and audit-related services,
- includes documentation/runbooks for integration and experiment execution.

This module is the central Information Assurance control point in the architecture.

### `governdata-fe`

Next.js frontend for the governance/developer portal.

Main responsibilities:

- portal pages for onboarding and governance API usage,
- docs and dashboard experiences for platform consumers,
- key/snippet/dev-focused pages for integration workflows,
- user auth/register flows for portal access.

This module supports developer enablement and governance platform usability.

### `experiment`

Experiment orchestration, raw outputs, and research artifacts.

Main responsibilities:

- scripted execution of full benchmark matrices,
- reproducibility support (run scripts, reproducibility appendix),
- storage of raw and processed experiment outputs (JSON/TeX/etc.),
- generation of comparative evidence used in research write-ups.

This module is the empirical backbone of the project.

## Suggested Run/Study Order

For understanding or reproducing the project, the recommended order is:

1. Read governance documentation in `governdata/docs`.
2. Start `governdata` backend and confirm governance endpoints.
3. Start `ehr-emr-be` backend with governance client enabled.
4. Start `ehr-emr-fe` to exercise clinical flows.
5. Optionally start `governdata-fe` for portal/docs workflows.
6. Run experiment scripts in `experiment/scripts` for comparative benchmarking.

## Security and Assurance Focus Areas

This project is designed to support Information Assurance analysis across:

- **Access control assurance**: consistency and correctness of authorization decisions.
- **Audit integrity**: trustworthiness and traceability of governance/audit events.
- **Policy externalization**: separation of policy logic from application code.
- **Operational performance**: latency/throughput impact of governance architecture choices.
- **Reproducibility**: repeatable experiment execution and artifact generation.

## Experimental Outputs

The `experiment` folder includes:

- run scripts for end-to-end scenario execution,
- raw result files and latency outputs,
- TeX and document artifacts used to prepare report material,
- journey/runbook-style notes that document execution and observations.

Together, these artifacts support transparent replication and defense of findings.

## Notes for Future Maintainers

- This root repository now tracks all five modules together as one workspace.
- Some folders contain generated/build artifacts (`target`, `.next`, `node_modules`) and local environment files (`.env`, `.env.local`).
- Before publishing externally, ensure secrets and local machine artifacts are excluded via `.gitignore` and review.

## Course Context

This codebase is a research platform for an Information Assurance graduate class, intended to demonstrate both:

- practical system implementation across multiple components, and
- rigorous comparative evaluation of governance/security architectures.

If you are reading this as part of project handoff or grading, start with the folders in this README and then follow the runbooks in `governdata/docs` plus scripts in `experiment/scripts`.

## Clone and Reproduce

### 1) Clone repository

```bash
git clone <YOUR_REPOSITORY_URL> Governdata
cd Governdata
```

### 2) Prepare environment templates

Each module now has an `.env.example` template. Copy and adjust as needed:

```bash
cp governdata/.env.example governdata/.env
cp governdata-fe/.env.example governdata-fe/.env.local
cp ehr-emr-fe/.env.example ehr-emr-fe/.env.local
cp ehr-emr-be/.env.example ehr-emr-be/.env
cp experiment/.env.example experiment/.env
```

### 3) Prerequisites (global)

- Java 25+
- Maven 3.9+ (or use included `mvnw`)
- Node.js 20+ (Node 22 recommended) and npm 10+
- PostgreSQL 15+
- Python 3.10+
- `curl` and `psql`
- Optional advanced mode:
  - OPA (for OPA runtime experiments)
  - Hyperledger Fabric network + chaincode (for real blockchain mode)

### 4) Start modules in recommended order

1. `governdata` (governance backend)
2. `ehr-emr-be` (clinical backend)
3. `ehr-emr-fe` (clinical UI)
4. `governdata-fe` (developer portal, optional)
5. `experiment` scripts (benchmark/research runs)

---

## Per-Folder Prerequisites and Run Guides

Use each module README for complete run instructions:

- `governdata/README.md`
- `ehr-emr-be/README.md`
- `ehr-emr-fe/README.md`
- `governdata-fe/README.md`
- `experiment/README.md`

Quick summary:

### `governdata`

- **Purpose:** Governance policy + authorization + audit platform
- **Prereqs:** Java/Maven/PostgreSQL, optional OPA/Fabric
- **Run:** `./mvnw spring-boot:run`
- **Default URL:** `http://localhost:8080`

### `ehr-emr-be`

- **Purpose:** EHR/EMR API backend and system of record
- **Prereqs:** Java/Maven/PostgreSQL and governance URL/API key setup
- **Run:** `./mvnw spring-boot:run`
- **Default URL:** `http://localhost:8080` (change port if running with governdata simultaneously)

### `ehr-emr-fe`

- **Purpose:** Clinical frontend for patient workflows
- **Prereqs:** Node/npm + running EHR backend
- **Run:** `npm install && npm run dev`
- **Default URL:** `http://localhost:3000`

### `governdata-fe`

- **Purpose:** Governance developer portal and docs UI
- **Prereqs:** Node/npm + running governance backend
- **Run:** `npm install && npm run dev`
- **Default URL:** `http://localhost:3000` (use different port if both frontends run together)

### `experiment`

- **Purpose:** Reproducible six-experiment benchmark execution and artifacts
- **Prereqs:** Python, curl, psql, running governance backend, API key
- **Run:** `./scripts/run_full_six_experiments.sh`
- **Outputs:** `experiment/raw/*.json`

---

## Full Reproduction Workflow (Suggested)

1. Configure PostgreSQL databases for:
   - `governdata`
   - `ehr_emr`
2. Configure and start `governdata`.
3. Configure and start `ehr-emr-be` with governance integration enabled.
4. Start `ehr-emr-fe` and validate end-user flows.
5. Start `governdata-fe` for portal/docs validation.
6. Run `experiment/scripts/run_full_six_experiments.sh`.
7. Archive evidence artifacts from `experiment/raw`.
8. Use TeX/docs artifacts in `experiment` + `governdata/docs` for reporting and defense.
