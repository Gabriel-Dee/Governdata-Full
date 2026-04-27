package com.governdata.governdata.policy.router;

import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.policy.context.PolicyEvaluationContext;
import com.governdata.governdata.policy.runtime.PolicyRuntime;
import com.governdata.governdata.policy.runtime.json.JsonPolicyRuntime;
import com.governdata.governdata.policy.runtime.opa.OpaPolicyRuntime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PolicyRuntimeRouter {

    private final JsonPolicyRuntime jsonPolicyRuntime;
    private final OpaPolicyRuntime opaPolicyRuntime;

    @Value("${governance.policy.runtime:JSON}")
    private String runtimeMode;

    public AuthorizationDecision evaluate(
            PolicyEvaluationContext context,
            String policyContent,
            Long policyVersionId,
            String policyVersionHash
    ) {
        PolicyRuntime runtime = resolveRuntime();
        return runtime.evaluate(context, policyContent, policyVersionId, policyVersionHash);
    }

    private PolicyRuntime resolveRuntime() {
        if ("OPA".equalsIgnoreCase(runtimeMode)) {
            return opaPolicyRuntime;
        }
        return jsonPolicyRuntime;
    }
}
