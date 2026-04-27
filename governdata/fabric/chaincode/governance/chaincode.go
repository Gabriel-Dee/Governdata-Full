package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/hyperledger/fabric-chaincode-go/v2/shim"
	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

// DecisionRecord is the payload stored on the ledger (no patient data).
type DecisionRecord struct {
	RequestID     string `json:"requestId"`
	Decision      string `json:"decision"`
	PolicyHash    string `json:"policyHash"`
	Timestamp     string `json:"timestamp"`
	ActorIdentity string `json:"actorIdentity"`
}

// GovernanceContract records authorization decisions for tamper-evident audit.
type GovernanceContract struct {
	contractapi.Contract
}

// RecordDecision stores a governance decision keyed by requestId.
// Args: requestId, decision (ALLOW|DENY), policyHash, timestamp, actorIdentity.
// No patient data is stored on chain.
func (c *GovernanceContract) RecordDecision(ctx contractapi.TransactionContextInterface,
	requestID, decision, policyHash, timestamp, actorIdentity string) error {

	requestID = strings.TrimSpace(requestID)
	if requestID == "" {
		return fmt.Errorf("requestId is required")
	}
	decision = strings.TrimSpace(strings.ToUpper(decision))
	if decision != "ALLOW" && decision != "DENY" {
		return fmt.Errorf("decision must be ALLOW or DENY")
	}
	if strings.TrimSpace(timestamp) == "" {
		return fmt.Errorf("timestamp is required")
	}

	record := DecisionRecord{
		RequestID:     requestID,
		Decision:      decision,
		PolicyHash:    strings.TrimSpace(policyHash),
		Timestamp:     timestamp,
		ActorIdentity: strings.TrimSpace(actorIdentity),
	}
	payload, err := json.Marshal(record)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(requestID, payload)
}

// GetDecision returns the stored decision record for a requestId.
func (c *GovernanceContract) GetDecision(ctx contractapi.TransactionContextInterface, requestID string) (*DecisionRecord, error) {
	payload, err := ctx.GetStub().GetState(strings.TrimSpace(requestID))
	if err != nil {
		return nil, err
	}
	if payload == nil {
		return nil, fmt.Errorf("no decision found for requestId %s", requestID)
	}
	var record DecisionRecord
	if err := json.Unmarshal(payload, &record); err != nil {
		return nil, err
	}
	return &record, nil
}

func main() {
	cc, err := contractapi.NewChaincode(&GovernanceContract{})
	if err != nil {
		panic(err)
	}

	// Support both in-process peer mode and external service (CCAAS) mode.
	if address := strings.TrimSpace(os.Getenv("CHAINCODE_SERVER_ADDRESS")); address != "" {
		ccid := strings.TrimSpace(os.Getenv("CHAINCODE_ID"))
		if ccid == "" {
			panic("CHAINCODE_ID is required when CHAINCODE_SERVER_ADDRESS is set")
		}
		server := &shim.ChaincodeServer{
			CCID:    ccid,
			Address: address,
			CC:      cc,
			TLSProps: shim.TLSProperties{
				Disabled: true,
			},
		}
		if err := server.Start(); err != nil {
			panic(err)
		}
		return
	}

	if err := cc.Start(); err != nil {
		panic(err)
	}
}
