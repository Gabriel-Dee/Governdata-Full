# Experiment Module (`experiment`)

This folder contains reproducible benchmark orchestration, raw outputs, and report artifacts for the six-experiment Information Assurance study.

## Prerequisites

- Bash (zsh/bash shell)
- Python 3.10+
- `curl`
- `psql` (PostgreSQL client)
- Running `governdata` backend API
- For full real-mode experiments: configured OPA + Fabric in governance backend

## Environment setup

1. Copy template:

```bash
cp .env.example .env
```

2. Set values in `.env`:

- `GOV_BASE_URL` (default `http://localhost:8080`)
- `GOVERNANCE_API_KEY` (required for API calls)
- `GOV_DB_NAME` and/or `GOV_DB_URL` for tamper verification SQL steps

3. Export env before running scripts:

```bash
set -a
source .env
set +a
```

## Core scripts

- `scripts/run_full_six_experiments.sh` (master workflow)
- `scripts/run_governance_matrix.sh` (runtime/storage matrix orchestration)
- `scripts/full_experiment_run.py` (single-run capture and metrics)

## Run all six experiments

```bash
chmod +x scripts/run_full_six_experiments.sh
./scripts/run_full_six_experiments.sh
```

Optional explain mode:

```bash
./scripts/run_full_six_experiments.sh --explain
```

## Output artifacts

Results are written under `raw/`, including:

- `full_experiment_*.json`
- `matrix_summary_*.json`
- `tamper_journey_*.json`

These are the primary evidence files for reporting and defense.

## Run-to-completion checklist

1. Start governance backend and verify `GET /actuator/health`.
2. Ensure API key is valid and loaded in environment.
3. Run `run_full_six_experiments.sh`.
4. Archive generated `raw/*.json` outputs.
5. Use `.tex` and journey docs for write-up alignment:
   - `EXPERIMENT_JOURNEY.md`
   - `GovernData_Experimentation_Results.tex`
   - `EXPERIMENT_REPRODUCIBILITY_APPENDIX.tex`
