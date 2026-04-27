package com.governdata.governdata.persistence.repository;

import com.governdata.governdata.persistence.entity.DecisionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DecisionRepository extends JpaRepository<DecisionEntity, Long> {

    long countByEngineType(String engineType);

    long countByEngineTypeAndDecision(String engineType, String decision);

    @Query(value = """
        SELECT d.engine_type AS "engineType",
               COUNT(*) AS "total",
               COUNT(d.latency_ms) AS "withLatency",
               AVG(d.latency_ms) AS "avgMs",
               MIN(d.latency_ms) AS "minMs",
               MAX(d.latency_ms) AS "maxMs",
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY d.latency_ms) AS "p50Ms",
               PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY d.latency_ms) AS "p95Ms",
               PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY d.latency_ms) AS "p99Ms"
        FROM decisions d
        WHERE d.latency_ms IS NOT NULL
        GROUP BY d.engine_type
        """, nativeQuery = true)
    List<LatencyStatsProjection> latencyStatsByEngine();

    interface LatencyStatsProjection {
        String getEngineType();
        long getTotal();
        long getWithLatency();
        Double getAvgMs();
        Integer getMinMs();
        Integer getMaxMs();
        Double getP50Ms();
        Double getP95Ms();
        Double getP99Ms();
    }

    @Query(value = """
        SELECT COUNT(*)
        FROM decisions d
        JOIN authorization_requests ar ON ar.id = d.authorization_request_id
        WHERE d.engine_type = :engineType
          AND ar.tenant_id = :tenantId
        """, nativeQuery = true)
    long countByEngineTypeForTenant(@Param("engineType") String engineType, @Param("tenantId") Long tenantId);

    @Query(value = """
        SELECT COUNT(*)
        FROM decisions d
        JOIN authorization_requests ar ON ar.id = d.authorization_request_id
        WHERE d.engine_type = :engineType
          AND d.decision = :decision
          AND ar.tenant_id = :tenantId
        """, nativeQuery = true)
    long countByEngineTypeAndDecisionForTenant(
            @Param("engineType") String engineType,
            @Param("decision") String decision,
            @Param("tenantId") Long tenantId
    );

    @Query(value = """
        SELECT d.engine_type AS "engineType",
               COUNT(*) AS "total",
               COUNT(d.latency_ms) AS "withLatency",
               AVG(d.latency_ms) AS "avgMs",
               MIN(d.latency_ms) AS "minMs",
               MAX(d.latency_ms) AS "maxMs",
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY d.latency_ms) AS "p50Ms",
               PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY d.latency_ms) AS "p95Ms",
               PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY d.latency_ms) AS "p99Ms"
        FROM decisions d
        JOIN authorization_requests ar ON ar.id = d.authorization_request_id
        WHERE d.latency_ms IS NOT NULL
          AND ar.tenant_id = :tenantId
        GROUP BY d.engine_type
        """, nativeQuery = true)
    List<LatencyStatsProjection> latencyStatsByEngineForTenant(@Param("tenantId") Long tenantId);
}
