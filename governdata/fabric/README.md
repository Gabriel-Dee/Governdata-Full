# Hyperledger Fabric integration (audit anchoring)

Authorization decisions are evaluated by the **POLICY_CODE** engine (JSON or OPA). **Fabric** is used to **anchor audit-related records** (via `FabricGatewayService` and `/api/v1/audit/ingest`), not as a separate “blockchain governance engine.” The legacy `BLOCKCHAIN` engine type has been removed.

The platform can record hashes / decisions on a Hyperledger Fabric ledger for tamper-evident auditability. No patient or PHI payload is stored on chain; only identifiers and hashes as implemented by chaincode.

## Prerequisites

- Docker and Docker Compose
- Go 1.21+ (for building chaincode)
- [Hyperledger Fabric samples](https://github.com/hyperledger/fabric-samples) (test-network)

## 1. Start Fabric test-network

Clone and use the official Fabric samples:

```bash
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
```

This brings up two orgs, creates channel `mychannel`, and runs a CA. The app expects **channel name** `mychannel` by default (override with `FABRIC_CHANNEL_NAME`).

## 2. Package and deploy the governance chaincode

From this repo, the chaincode lives under `fabric/chaincode/governance/`. It exposes:

- **RecordDecision(requestId, decision, policyHash, timestamp, actorIdentity)** – writes a decision record keyed by `requestId`.
- **GetDecision(requestId)** – reads the record (for verification).

Build and package (from repo root):

```bash
cd fabric/chaincode/governance
go mod tidy
cd ../../..
```

From the Fabric test-network directory, package the chaincode (point to the absolute path of `fabric/chaincode/governance`):

```bash
# In fabric-samples/test-network
export CC_SRC_PATH=/path/to/governdata/fabric/chaincode/governance
peer lifecycle chaincode package governance.tar.gz --lang golang --path $CC_SRC_PATH --label governance_1.0
```

Then install, approve, and commit the chaincode on the channel using the usual Fabric 2.x lifecycle steps (install on Org1 and Org2 peers, approve for both orgs, commit). Name the chaincode **governance** and use version **1.0** so the app can find it (default `FABRIC_CHAINCODE_NAME=governance`).

Example (after packaging), from `test-network`:

```bash
# Install on Org1
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ROOTCERT_FILE=$PWD/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
peer lifecycle chaincode install governance.tar.gz

# Similar for Org2, then approve and commit (see Fabric docs for full lifecycle).
```

## 3. Create wallet and identity for the application

The Java app uses the Fabric Gateway with a **wallet** and an **identity label**. You need a wallet directory and an identity (cert + key) that is allowed to submit transactions on the channel.

For the test-network, you can use the Org1 admin identity. Export it into a wallet structure that the Fabric Gateway Java API expects (see [Fabric Gateway Java docs](https://hyperledger.github.io/fabric-gateway-java/) and sample scripts in fabric-samples that create a filesystem wallet). Typical layout:

- **Wallet path**: a directory, e.g. `./wallet`.
- **Identity label**: the name you give the identity in the wallet, e.g. `user1` or `org1-admin`.

Set:

- `FABRIC_WALLET_PATH` – absolute or relative path to the wallet directory.
- `FABRIC_IDENTITY_LABEL` – the identity name in the wallet.

## 4. Connection profile

The app needs a Fabric **connection profile** (JSON) that describes the network (peers, orderers, CAs). For the test-network, use the generated profile, e.g.:

- `fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json`

Set:

- `FABRIC_CONNECTION_PROFILE` – path to that JSON file.

## 5. Run the application with Fabric (stub off)

Ensure the database is up and migrations have run. Policy evaluation stays **`governance.default-engine: POLICY_CODE`**. Turn off the Fabric stub and point at your network:

```bash
export FABRIC_CONNECTION_PROFILE=/path/to/connection-org1.json
export FABRIC_WALLET_PATH=/path/to/wallet
export FABRIC_IDENTITY_LABEL=user1
export FABRIC_CHANNEL_NAME=mychannel
export FABRIC_CHAINCODE_NAME=governance
export GOVERNANCE_BLOCKCHAIN_STUB=false
export GOVERNANCE_AUDIT_STORAGE=BOTH

./mvnw spring-boot:run -Dspring-boot.run.arguments="--governance.blockchain.stub=false"
```

Or set in `application-dev.yml`:

```yaml
governance:
  default-engine: POLICY_CODE
  audit:
    storage: BOTH
  blockchain:
    stub: false
    fabric:
      connection-profile-path: /path/to/connection-org1.json
      channel-name: mychannel
      chaincode-name: governance
      wallet-path: /path/to/wallet
      identity-label: user1
```

## 6. Verify decisions on chain

After sending `POST /api/v1/authorize` requests, each response includes `evidenceId` (the Fabric transaction ID). The same ID is stored in `decisions.evidence_id` and in the audit records.

To confirm the record on chain, use the peer CLI to query the chaincode (e.g. `GetDecision` with the requestId) or use a Fabric explorer. The stored payload contains only `requestId`, `decision`, `policyHash`, `timestamp`, and `actorIdentity` – no patient data – so you can validate that the governance layer is recording decisions and support “who tampered with data at what time” auditability.

## 7. Real-mode notes (CCAAS, profiles, endorsement)

For a **full** local setup used in research (chaincode-as-a-service, enriched connection JSON, Org1-only endorsement for single-peer submits, wallet file layout), see:

**[docs/implementation-fabric-real-mode.md](../docs/implementation-fabric-real-mode.md)**

This README stays the high-level overview; that document is the operational runbook for repeating real Fabric experiments.

## Configuration summary

| Env / property | Default | Description |
|----------------|--------|-------------|
| `governance.blockchain.stub` | `true` | If `true`, no Fabric call; fake tx id. Set `false` to use Fabric. |
| `FABRIC_CONNECTION_PROFILE` / `governance.blockchain.fabric.connection-profile-path` | – | Path to Fabric connection profile JSON. |
| `FABRIC_CHANNEL_NAME` / `governance.blockchain.fabric.channel-name` | `mychannel` | Channel name. |
| `FABRIC_CHAINCODE_NAME` / `governance.blockchain.fabric.chaincode-name` | `governance` | Chaincode name. |
| `FABRIC_WALLET_PATH` / `governance.blockchain.fabric.wallet-path` | – | Path to Gateway wallet directory. |
| `FABRIC_IDENTITY_LABEL` / `governance.blockchain.fabric.identity-label` | – | Identity label in the wallet. |
