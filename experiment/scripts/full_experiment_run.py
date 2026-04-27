#!/usr/bin/env python3
"""
Full GovernData experiment capture against a running governance service.
Run after starting Spring Boot with the desired GOVERNANCE_POLICY_RUNTIME and GOVERNANCE_AUDIT_STORAGE.

Usage:
  python3 full_experiment_run.py [--base-url URL] [--api-key KEY] [--label LABEL]

Outputs JSON to experiment/raw/full_experiment_<label>_<timestamp>.json
"""
from __future__ import annotations

import argparse
import json
import statistics
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from uuid import uuid4


def post_json(url: str, payload: dict, headers: dict | None = None, timeout: float = 60.0) -> tuple[int, dict]:
    data = json.dumps(payload).encode("utf-8")
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = json.loads(r.read().decode())
            return r.status, body
    except urllib.error.HTTPError as e:
        raw = e.read().decode() if e.fp else ""
        try:
            return e.code, json.loads(raw) if raw else {"error": str(e)}
        except json.JSONDecodeError:
            return e.code, {"raw": raw, "error": str(e)}


def get_json(url: str, headers: dict | None = None, timeout: float = 30.0) -> tuple[int, dict]:
    h = dict(headers or {})
    req = urllib.request.Request(url, headers=h, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, json.loads(r.read().decode())


def corpus_requests():
    """Three scenarios aligned with thesis doc: valid treatment, cross-dept deny, research deny."""
    ts = "2026-03-29T12:00:00.000Z"
    return [
        {
            "name": "treatment_valid",
            "request": {
                "requestId": str(uuid4()),
                "subject": {
                    "userId": "doctor-1",
                    "role": "Doctor",
                    "department": "Cardiology",
                },
                "resource": {"type": "PatientRecord", "resourceId": "patient-1"},
                "action": "READ",
                "context": {
                    "purpose": "treatment",
                    "location": "hospital",
                    "timestamp": ts,
                    "attributes": {
                        "legalBasis": "HIPAA_TREATMENT",
                        "consentGranted": True,
                        "region": "US",
                        "recordDepartment": "Cardiology",
                    },
                },
            },
        },
        {
            "name": "cross_department",
            "request": {
                "requestId": str(uuid4()),
                "subject": {
                    "userId": "doctor-2",
                    "role": "Doctor",
                    "department": "Radiology",
                },
                "resource": {"type": "PatientRecord", "resourceId": "patient-1"},
                "action": "READ",
                "context": {
                    "purpose": "treatment",
                    "location": "hospital",
                    "timestamp": ts,
                    "attributes": {
                        "legalBasis": "HIPAA_TREATMENT",
                        "consentGranted": True,
                        "region": "US",
                        "recordDepartment": "Cardiology",
                    },
                },
            },
        },
        {
            "name": "research_invalid",
            "request": {
                "requestId": str(uuid4()),
                "subject": {
                    "userId": "researcher-1",
                    "role": "Researcher",
                    "department": "Research",
                },
                "resource": {"type": "PatientRecord", "resourceId": "patient-1"},
                "action": "READ",
                "context": {
                    "purpose": "research",
                    "location": "lab",
                    "timestamp": ts,
                    "attributes": {
                        "legalBasis": "GDPR",
                        "consentGranted": False,
                        "region": "EU",
                        "recordDepartment": "Research",
                    },
                },
            },
        },
    ]


def run_benchmark(base_url: str, api_key: str, iterations: int, warmup: int) -> dict:
    headers = {"X-API-Key": api_key}
    items = corpus_requests()
    requests_only = [x["request"] for x in items]
    # Fresh UUIDs per benchmark call for uniqueness
    for r in requests_only:
        r["requestId"] = str(uuid4())
    payload = {"requests": requests_only, "iterations": iterations}
    url = f"{base_url.rstrip('/')}/api/v1/benchmark/policy-runtime"
    status, body = post_json(url, payload, headers)
    return {"httpStatus": status, "benchmark": body, "warmupDiscarded": warmup, "note": "Server-side benchmark; warmup is advisory only."}


def run_authorize_latency(base_url: str, api_key: str, iterations: int, warmup: int) -> dict:
    headers = {"X-API-Key": api_key}
    latencies = []
    decisions = []
    items = corpus_requests()
    for i in range(iterations):
        for item in items:
            req = json.loads(json.dumps(item["request"]))
            req["requestId"] = str(uuid4())
            t0 = time.perf_counter()
            status, body = post_json(
                f"{base_url.rstrip('/')}/api/v1/authorize", req, headers
            )
            ms = (time.perf_counter() - t0) * 1000
            if status >= 400:
                latencies.append({"case": item["name"], "ms": round(ms, 2), "error": body})
            else:
                latencies.append(
                    {
                        "case": item["name"],
                        "ms": round(ms, 2),
                        "decision": body.get("decision"),
                        "runtimeUsed": body.get("runtimeUsed"),
                        "evidenceId": body.get("evidenceId"),
                    }
                )
                decisions.append(body)
    # Drop first `warmup` full rounds (3 requests each)
    drop = warmup * len(items)
    warmed = latencies[drop:] if drop < len(latencies) else latencies
    ms_vals = [x["ms"] for x in warmed if "ms" in x]
    summary = {}
    if ms_vals:
        summary = {
            "count": len(ms_vals),
            "min_ms": round(min(ms_vals), 2),
            "max_ms": round(max(ms_vals), 2),
            "avg_ms": round(statistics.mean(ms_vals), 2),
            "p95_ms": round(sorted(ms_vals)[int(max(0, len(ms_vals) * 0.95 - 1))], 2)
            if len(ms_vals) > 1
            else ms_vals[0],
        }
    return {
        "samples": latencies,
        "afterWarmupSummary": summary,
        "warmup_rounds": warmup,
    }


def run_unauthorized_scenarios(base_url: str, api_key: str) -> list[dict]:
    headers = {"X-API-Key": api_key}
    ts = "2026-03-29T12:00:00.000Z"
    scenarios = [
        {
            "name": "gdpr_no_consent_read",
            "request": {
                "requestId": str(uuid4()),
                "subject": {"userId": "doc-1", "role": "Doctor", "department": "Outpatient"},
                "resource": {"type": "PatientRecord", "resourceId": "patient-x"},
                "action": "READ",
                "context": {
                    "purpose": "treatment",
                    "location": "clinic",
                    "timestamp": ts,
                    "attributes": {
                        "legalBasis": "GDPR_CONSENT",
                        "consentGranted": False,
                        "region": "EU",
                        "recordDepartment": "Outpatient",
                    },
                },
            },
            "expect_decision": "DENY",
        },
    ]
    out = []
    for s in scenarios:
        st, body = post_json(
            f"{base_url.rstrip('/')}/api/v1/authorize", s["request"], headers
        )
        out.append(
            {
                "name": s["name"],
                "httpStatus": st,
                "expectedDecision": s["expect_decision"],
                "actualDecision": body.get("decision"),
                "runtimeUsed": body.get("runtimeUsed"),
                "reason": body.get("reason"),
            }
        )
    return out


def run_policy_version_probe(base_url: str, api_key: str) -> dict:
    headers = {"X-API-Key": api_key}
    ts = "2026-03-29T12:00:00.000Z"
    req = {
        "requestId": str(uuid4()),
        "subject": {"userId": "doctor-1", "role": "Doctor", "department": "Cardiology"},
        "resource": {"type": "PatientRecord", "resourceId": "patient-v"},
        "action": "READ",
        "context": {
            "purpose": "treatment",
            "location": "hospital",
            "timestamp": ts,
            "attributes": {
                "legalBasis": "HIPAA_TREATMENT",
                "consentGranted": True,
                "region": "US",
                "recordDepartment": "Cardiology",
            },
        },
    }
    r1 = post_json(f"{base_url.rstrip('/')}/api/v1/authorize", req, headers)
    req["requestId"] = str(uuid4())
    r2 = post_json(f"{base_url.rstrip('/')}/api/v1/authorize", req, headers)
    return {
        "call1": {"status": r1[0], "policyVersion": r1[1].get("policyVersion"), "policyVersionId": r1[1].get("policyVersionId")},
        "call2": {"status": r2[0], "policyVersion": r2[1].get("policyVersion"), "policyVersionId": r2[1].get("policyVersionId")},
    }


def run_ingest_verify(base_url: str, api_key: str, tag: str) -> dict:
    headers = {"X-API-Key": api_key}
    corr = f"{tag}-{int(time.time())}"
    ingest_body = {
        "sourceSystem": "ehr",
        "actor": "admin",
        "targetResource": "patient-audit",
        "action": "READ",
        "decision": "ALLOW",
        "timestamp": "2026-03-29T21:00:00Z",
        "correlationId": corr,
        "metadata": {"experiment": tag, "run": "full_experiment_run.py"},
    }
    st_i, ingest = post_json(
        f"{base_url.rstrip('/')}/api/v1/audit/ingest", ingest_body, headers
    )
    st_v, verify = get_json(
        f"{base_url.rstrip('/')}/api/v1/audit/verify/{corr}", headers
    )
    return {
        "correlationId": corr,
        "ingestStatus": st_i,
        "ingest": ingest,
        "verifyStatus": st_v,
        "verify": verify,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://localhost:8080")
    ap.add_argument("--api-key", default="gdk_tfNTWMEh-hmtOJ9jHQuj2UNIGYkAJsKimNUK3rJMVJE")
    ap.add_argument("--label", default="run")
    ap.add_argument("--iterations", type=int, default=8)
    ap.add_argument("--warmup", type=int, default=2)
    args = ap.parse_args()

    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    out = {
        "meta": {
            "timestampUtc": datetime.now(timezone.utc).isoformat(),
            "baseUrl": args.base_url,
            "label": args.label,
            "iterationsPerCase": args.iterations,
            "warmupRounds": args.warmup,
        },
        "health": None,
        "experiment1_benchmark": None,
        "experiment1_client_latency": None,
        "experiment4_policy_version": None,
        "experiment5_unauthorized": None,
        "experiment_ingest_verify_current_mode": None,
    }

    try:
        st, health = get_json(f"{args.base_url.rstrip('/')}/actuator/health")
        out["health"] = {"status": st, "body": health}
    except Exception as e:
        out["health"] = {"error": str(e)}

    # Benchmark reuses the same request bodies per iteration; server rejects duplicate requestId (409).
    # Keep iterations=1 for /benchmark; use client latency for multi-iteration stats.
    out["experiment1_benchmark"] = run_benchmark(
        args.base_url, args.api_key, iterations=1, warmup=0
    )
    out["experiment1_client_latency"] = run_authorize_latency(
        args.base_url, args.api_key, args.iterations, args.warmup
    )
    out["experiment4_policy_version"] = run_policy_version_probe(args.base_url, args.api_key)
    out["experiment5_unauthorized"] = run_unauthorized_scenarios(args.base_url, args.api_key)
    out["experiment_ingest_verify_current_mode"] = run_ingest_verify(
        args.base_url, args.api_key, args.label
    )

    import os

    script_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.normpath(os.path.join(script_dir, "..", "raw"))
    os.makedirs(raw_dir, exist_ok=True)
    path = os.path.join(raw_dir, f"full_experiment_{args.label}_{ts}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
