package com.governdata.governdata.service.benchmark;

import com.governdata.governdata.api.dto.AuthorizationDecision;
import com.governdata.governdata.api.dto.AuthorizationRequest;
import com.governdata.governdata.api.dto.benchmark.BenchmarkRequest;
import com.governdata.governdata.api.dto.benchmark.BenchmarkResponse;
import com.governdata.governdata.service.GovernanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BenchmarkHarnessService {

    private final GovernanceService governanceService;

    @Value("${governance.policy.runtime:JSON}")
    private String runtime;

    public BenchmarkResponse run(BenchmarkRequest request) {
        long allow = 0;
        long deny = 0;
        List<Long> latencies = new ArrayList<>();

        int corpusSize = request.getRequests().size();
        long totalEvaluations = (long) request.getIterations() * corpusSize;

        for (int i = 0; i < request.getIterations(); i++) {
            for (AuthorizationRequest authz : request.getRequests()) {
                long start = System.nanoTime();
                AuthorizationDecision decision = governanceService.authorize(authz);
                long elapsedMs = (System.nanoTime() - start) / 1_000_000;
                latencies.add(elapsedMs);

                if (decision.getDecision() == AuthorizationDecision.Decision.ALLOW) {
                    allow++;
                } else {
                    deny++;
                }
            }
        }

        double avg = latencies.stream().mapToLong(Long::longValue).average().orElse(0.0);
        long p95 = percentile(latencies, 0.95);

        return BenchmarkResponse.builder()
                .runtime(runtime)
                .iterations(request.getIterations())
                .totalRequests(corpusSize)
                .totalEvaluations(totalEvaluations)
                .allowCount(allow)
                .denyCount(deny)
                .averageLatencyMs(avg)
                .p95LatencyMs(p95)
                .build();
    }

    private static long percentile(List<Long> values, double p) {
        if (values.isEmpty()) return 0;
        List<Long> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        int idx = (int) Math.ceil(p * sorted.size()) - 1;
        if (idx < 0) idx = 0;
        if (idx >= sorted.size()) idx = sorted.size() - 1;
        return sorted.get(idx);
    }
}
