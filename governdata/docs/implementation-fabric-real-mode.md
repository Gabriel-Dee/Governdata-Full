# Hyperledger Fabric — real-mode implementation (audit anchoring)

This document explains **how GovernData connects to a real Fabric network**, how governance chaincode is deployed (including **chaincode-as-a-service / CCAAS**), wallet identities, connection profiles, endorsement policy notes, and how to verify **non-stub** transaction IDs.

---

## 1. What Fabric does in GovernData

- **Authorization** (`POST /api/v1/authorize`): after a policy decision, `FabricGatewayService` may submit a chaincode transaction to **record** a minimal decision record (no PHI on chain).
- **Audit ingest** (`POST /api/v1/audit/ingest`): hashes and metadata are anchored; verification (`GET /api/v1/audit/verify/{correlationId}`) can compare DB state with chain state.

Stub mode (`governance.blockchain.stub=true`) **never** talks to Fabric and generates synthetic `stub-tx-*` IDs — **not** used for real-mode experiments.

Implementation entry: `governdata/src/main/java/com/governdata/governdata/engines/blockchain/FabricGatewayService.java`.

---

## 2. Chaincode

- **Source**: `governdata/fabric/chaincode/governance/`
- **Functions** (Go contract API):
  - `RecordDecision(requestId, decision, policyHash, timestamp, actorIdentity)`
  - `GetDecision(requestId)`
- **CCAAS**: For environments where peer-side Docker chaincode builds fail (e.g. Docker socket issues), the chaincode runs as an **external service** built from `Dockerfile` in the same folder. The main entry supports `CHAINCODE_SERVER_ADDRESS` and `CHAINCODE_ID` for external mode.

Files:

- `fabric/chaincode/governance/chaincode.go` — contract + external server mode
- `fabric/chaincode/governance/Dockerfile` — image for CCAAS

---

## 3. Fabric test network (official samples)

Clone and start:

```bash
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
```

Deploy **CCAAS** chaincode from the GovernData repo path (example):

```bash
./network.sh deployCCAAS -c mychannel -ccn governance \
  -ccp "/absolute/path/to/governdata/fabric/chaincode/governance" \
  -ccv 1.1 \
  -ccep "OR('Org1MSP.member')"
```

The `-ccep` endorsement policy was used in this project so a **single-org** client submission can satisfy endorsement when the Java app only submits via **Org1** (typical for local dev).

**Note**: If you use the default channel endorsement policy without adjusting, you may see **ENDORSEMENT_POLICY_FAILURE** when only one peer signs — adjust policy or submit from both orgs.

---

## 4. Connection profile and wallet

- **Connection profile JSON** used by the Java Gateway:  
  `governdata/fabric/connection-org1-rich.json`  
  (derived from test-network `connection-org1.json` with explicit timeouts, channel, orderers.)

- **Wallet**: `governdata/fabric/wallet/org1-admin.id`  
  Filesystem wallet identity for **Org1 admin** (X.509 cert + private key). The identity file must include `"version": 1` for the Java wallet loader.

Environment:

```bash
export FABRIC_CONNECTION_PROFILE=/path/to/governdata/fabric/connection-org1-rich.json
export FABRIC_WALLET_PATH=/path/to/governdata/fabric/wallet
export FABRIC_IDENTITY_LABEL=org1-admin
export FABRIC_CHANNEL_NAME=mychannel
export FABRIC_CHAINCODE_NAME=governance
export GOVERNANCE_BLOCKCHAIN_STUB=false
```

---

## 5. CCAAS containers

After chaincode install/approve/commit, the test-network script starts Docker containers named like `peer0org1_governance_ccaas` on the `fabric_test` network. They must be running with the correct `CHAINCODE_ID` matching the **package id** from `peer lifecycle chaincode queryinstalled`.

If you upgrade chaincode, **remove old containers** and start new ones with the new package id.

---

## 6. Verifying real mode

1. Set `GOVERNANCE_BLOCKCHAIN_STUB=false`.
2. Call `POST /api/v1/authorize` with a valid API key.
3. Response `evidenceId` must **not** start with `stub-tx-`.
4. `POST /api/v1/audit/ingest` should return `verificationStatus: ANCHORED` and a real-looking `evidenceId` when Fabric is healthy.

---

## 7. Tamper-evidence behavior (verify API)

- If the DB row is **modified** so the recomputed hash ≠ stored hash, verify returns **`MISMATCH`** when chain evidence is checked consistently.
- If the DB row is **deleted**, verify can return **`VERIFIED_CHAIN_ONLY`** when the chain can still recover the anchor (see `AuditIngestionService`).

---

## 8. Prerequisites on the machine

- **Docker** (e.g. Colima on macOS) for Fabric peers and CCAAS images.
- **Go** for `go mod tidy` on chaincode.
- **Fabric binaries** from `install-fabric.sh` in `fabric-samples` (peer CLI, etc.).

---

## 9. Further reading in-repo

- `governdata/fabric/README.md` — original integration overview (update paths if you use CCAAS exclusively).

---

## 10. Thesis / presentation summary

- Fabric provides **tamper-evident** storage for hashes and decisions; **PHI stays off-chain**.
- Real mode **does** require operational overhead (Docker, chaincode lifecycle, wallet).
- The implementation isolates Fabric behind `FabricGatewayService` so policy code (JSON/OPA) stays independent of ledger details.
