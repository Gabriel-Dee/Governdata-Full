package com.governdata.governdata.engines.blockchain;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Transaction;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PreDestroy;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Submits governance decisions to Hyperledger Fabric chaincode (RecordDecision).
 * Returns the Fabric transaction ID for use as evidence_id. No patient data is sent on chain.
 */
@Service
public class FabricGatewayService {

    @Value("${governance.blockchain.fabric.connection-profile-path:}")
    private String connectionProfilePath;

    @Value("${governance.blockchain.fabric.channel-name:mychannel}")
    private String channelName;

    @Value("${governance.blockchain.fabric.chaincode-name:governance}")
    private String chaincodeName;

    @Value("${governance.blockchain.fabric.wallet-path:}")
    private String walletPath;

    @Value("${governance.blockchain.fabric.identity-label:}")
    private String identityLabel;

    @Value("${governance.blockchain.fabric.commit-timeout-seconds:30}")
    private long commitTimeoutSeconds = 30;

    @Value("${governance.blockchain.stub:true}")
    private boolean stub;

    /** True when no real Fabric network is connected (synthetic tx ids for local dev). */
    public boolean isStub() {
        return stub;
    }

    private volatile Gateway gateway;
    private volatile Contract contract;

    /**
     * Submits a decision record to the chain. Returns the Fabric transaction ID.
     *
     * @param requestId     client request ID (UUID string)
     * @param decision       ALLOW or DENY
     * @param policyHash     optional policy version hash (or empty string)
     * @param timestamp      decision timestamp (ISO-8601 or epoch millis string)
     * @param actorIdentity  who requested the decision (e.g. subject userId)
     * @return Fabric transaction ID to store in decisions.evidence_id
     */
    public String submitRecordDecision(
            String requestId,
            String decision,
            String policyHash,
            Instant timestamp,
            String actorIdentity
    ) throws Exception {
        if (stub) {
            return "stub-tx-" + (requestId != null ? requestId.replace("-", "").substring(0, Math.min(16, requestId.replace("-", "").length())) : "nil") + "-" + System.currentTimeMillis();
        }
        Contract c = getContract();
        Transaction tx = c.createTransaction("RecordDecision");
        tx.setCommitTimeout(commitTimeoutSeconds, TimeUnit.SECONDS);
        String txId = tx.getTransactionId();
        String ts = timestamp != null ? timestamp.toString() : Instant.now().toString();
        String hash = policyHash != null ? policyHash : "";
        String actor = actorIdentity != null ? actorIdentity : "";
        tx.submit(requestId, decision, hash, ts, actor);
        return txId;
    }

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /**
     * Reads a decision record from the chain (GetDecision). Used for GET /audit when storage is BLOCKCHAIN_ONLY.
     * When stub is true, returns empty.
     */
    public Optional<ChainDecisionRecord> getDecision(String requestId) {
        if (stub || requestId == null || requestId.isBlank()) {
            return Optional.empty();
        }
        try {
            Contract c = getContract();
            byte[] payload = c.evaluateTransaction("GetDecision", requestId.trim());
            if (payload == null || payload.length == 0) {
                return Optional.empty();
            }
            ChainDecisionRecord record = OBJECT_MAPPER.readValue(new String(payload, StandardCharsets.UTF_8), ChainDecisionRecord.class);
            return Optional.of(record);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /** DTO matching chaincode DecisionRecord (requestId, decision, policyHash, timestamp, actorIdentity). */
    public static class ChainDecisionRecord {
        private String requestId;
        private String decision;
        private String policyHash;
        private String timestamp;
        private String actorIdentity;

        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public String getDecision() { return decision; }
        public void setDecision(String decision) { this.decision = decision; }
        public String getPolicyHash() { return policyHash; }
        public void setPolicyHash(String policyHash) { this.policyHash = policyHash; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getActorIdentity() { return actorIdentity; }
        public void setActorIdentity(String actorIdentity) { this.actorIdentity = actorIdentity; }
    }

    private Contract getContract() throws Exception {
        if (contract != null) {
            return contract;
        }
        synchronized (this) {
            if (contract != null) {
                return contract;
            }
            if (connectionProfilePath == null || connectionProfilePath.isBlank()) {
                throw new IllegalStateException(
                        "Fabric connection profile path is not set. Set governance.blockchain.fabric.connection-profile-path when governance.blockchain.stub=false.");
            }
            if (walletPath == null || walletPath.isBlank() || identityLabel == null || identityLabel.isBlank()) {
                throw new IllegalStateException(
                        "Fabric wallet path and identity label must be set. Set governance.blockchain.fabric.wallet-path and identity-label when governance.blockchain.stub=false.");
            }
            Path cp = Paths.get(connectionProfilePath);
            Path wp = Paths.get(walletPath);
            Wallet wallet = Wallets.newFileSystemWallet(wp);
            Gateway.Builder builder = Gateway.createBuilder()
                    .identity(wallet, identityLabel)
                    .networkConfig(cp);
            Gateway g = builder.connect();
            this.gateway = g;
            this.contract = g.getNetwork(channelName).getContract(chaincodeName);
            return contract;
        }
    }

    @PreDestroy
    public void close() {
        Gateway g = gateway;
        if (g != null) {
            try {
                g.close();
            } catch (Exception e) {
                // ignore
            }
            gateway = null;
            contract = null;
        }
    }
}
