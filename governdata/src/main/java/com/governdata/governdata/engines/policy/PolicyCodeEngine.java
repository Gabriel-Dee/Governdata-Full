package com.governdata.governdata.engines.policy;

import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.api.dto.AuthorizationRequest;
import com.governdata.governdata.debug.RuntimeDebugLogger;
import com.governdata.governdata.engines.EngineType;
import com.governdata.governdata.engines.GovernanceEngine;
import com.governdata.governdata.persistence.entity.PolicyVersionEntity;
import com.governdata.governdata.persistence.repository.PolicyRepository;
import com.governdata.governdata.persistence.repository.PolicyVersionRepository;
import com.governdata.governdata.policy.context.PolicyEvaluationContext;
import com.governdata.governdata.policy.router.PolicyRuntimeRouter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

/**
 * Policy-as-code governance engine. Loads active versioned policy from DB,
 * normalizes request context, and delegates evaluation to configured runtime (JSON or OPA).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PolicyCodeEngine implements GovernanceEngine {

    private final PolicyRepository policyRepository;
    private final PolicyVersionRepository policyVersionRepository;
    private final PolicyRuntimeRouter policyRuntimeRouter;

    @Value("${governance.default-policy:default}")
    private String defaultPolicyName;

    @Value("${governance.policy-scope:GLOBAL}")
    private String policyScope;

    @Override
    public EngineType getEngineType() {
        return EngineType.POLICY_CODE;
    }

    @Override
    public AuthorizationDecision evaluate(AuthorizationRequest request) {
        Optional<PolicyVersionEntity> activeVersion = policyRepository.findByName(defaultPolicyName)
                .flatMap(p -> policyVersionRepository.findByPolicyIdAndScopeKeyAndActiveTrue(p.getId(), policyScope));

        // #region agent log
        RuntimeDebugLogger.log("run-curl", "H2", "PolicyCodeEngine:evaluate:policyLookup", "Active policy lookup result", Map.of(
                "defaultPolicy", defaultPolicyName,
                "scope", policyScope,
                "found", activeVersion.isPresent()
        ));
        // #endregion

        if (activeVersion.isEmpty()) {
            log.warn("No active policy version for policy '{}' and scope '{}'; denying", defaultPolicyName, policyScope);
            return AuthorizationDecision.builder()
                    .decision(AuthorizationDecision.Decision.DENY)
                    .engine(EngineType.POLICY_CODE.name())
                    .policyVersion(null)
                    .policyVersionId(null)
                    .evidenceId(null)
                    .reason("No active policy version configured for " + defaultPolicyName + " scope=" + policyScope)
                    .runtimeUsed("NONE")
                    .build();
        }

        PolicyVersionEntity version = activeVersion.get();
        PolicyEvaluationContext context = PolicyEvaluationContext.fromAuthorizationRequest(request);

        AuthorizationDecision decision = policyRuntimeRouter.evaluate(
                context,
                version.getContent(),
                version.getId(),
                version.getContentHash()
        );

        decision.setEngine(EngineType.POLICY_CODE.name());
        return decision;
    }
}
