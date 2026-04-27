package com.governdata.governdata.engines;

import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.api.dto.AuthorizationRequest;

public interface GovernanceEngine {

    EngineType getEngineType();

    AuthorizationDecision evaluate(AuthorizationRequest request);
}
