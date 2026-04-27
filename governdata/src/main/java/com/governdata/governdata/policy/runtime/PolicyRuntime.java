package com.governdata.governdata.policy.runtime;

import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.policy.context.PolicyEvaluationContext;

public interface PolicyRuntime {

    String mode();

    AuthorizationDecision evaluate(
            PolicyEvaluationContext context,
            String policyContent,
            Long policyVersionId,
            String policyVersionHash
    );
}
