package com.governdata.governdata.service.compliance;

import com.governdata.governdata.api.dto.compliance.*;
import com.governdata.governdata.persistence.entity.ComplianceCatalogRuleEntity;
import com.governdata.governdata.persistence.repository.ComplianceCatalogRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ComplianceCatalogService {

    static final String DISCLAIMER =
            "Automated results reflect only evidence flags you submit against this catalog; they do not constitute "
                    + "legal HIPAA or GDPR certification. Operational controls (MFA, TLS, de-identification pipelines) "
                    + "must be asserted by your integrator or monitoring stack.";

    private final ComplianceCatalogRuleRepository repository;

    public List<ComplianceCatalogRuleDTO> listCatalog(Set<String> frameworks) {
        return repository.findByFrameworkInOrderByFrameworkAscSortOrderAsc(frameworks.stream().sorted().toList())
                .stream()
                .map(ComplianceCatalogService::toDto)
                .toList();
    }

    public ComplianceEvaluateResponse evaluate(ComplianceEvaluateRequest request) {
        Set<String> frameworks = normalizeFrameworks(request.getFrameworks());
        List<ComplianceCatalogRuleEntity> rules =
                repository.findByFrameworkInOrderByFrameworkAscSortOrderAsc(frameworks.stream().sorted().toList());

        Map<String, Object> evidenceLower = new HashMap<>();
        if (request.getEvidence() != null) {
            for (Map.Entry<String, Object> e : request.getEvidence().entrySet()) {
                if (e.getKey() != null) {
                    evidenceLower.put(e.getKey().trim().toLowerCase(Locale.ROOT), e.getValue());
                }
            }
        }

        int pass = 0;
        int fail = 0;
        int unknown = 0;
        int informational = 0;
        int automated = 0;

        List<ComplianceRuleEvalResultDTO> results = new ArrayList<>();
        for (ComplianceCatalogRuleEntity r : rules) {
            if (!r.isAutomated()) {
                informational++;
                results.add(ComplianceRuleEvalResultDTO.builder()
                        .framework(r.getFramework())
                        .ruleCode(r.getRuleCode())
                        .legalReference(r.getLegalReference())
                        .category(r.getCategory())
                        .title(r.getTitle())
                        .evidenceKey(null)
                        .automated(false)
                        .status(ComplianceEvalStatus.INFORMATIONAL)
                        .detail("Not machine-verified; document organizationally.")
                        .build());
                continue;
            }

            automated++;
            String key = r.getEvidenceKey();
            if (key == null || key.isBlank()) {
                unknown++;
                results.add(resultRow(r, ComplianceEvalStatus.UNKNOWN, "Rule marked automated but has no evidence_key."));
                continue;
            }

            Object raw = evidenceLower.get(key.toLowerCase(Locale.ROOT));
            if (raw == null) {
                unknown++;
                results.add(resultRow(r, ComplianceEvalStatus.UNKNOWN, "No evidence submitted for key: " + key));
                continue;
            }

            if (isTruthy(raw)) {
                pass++;
                results.add(resultRow(r, ComplianceEvalStatus.PASS, "Evidence affirms control for: " + key));
            } else {
                fail++;
                results.add(resultRow(r, ComplianceEvalStatus.FAIL, "Evidence not affirmative for: " + key));
            }
        }

        ComplianceOverallStatus overall;
        if (automated == 0) {
            overall = ComplianceOverallStatus.NO_AUTOMATED_RULES;
        } else if (fail > 0) {
            overall = ComplianceOverallStatus.FAIL;
        } else if (unknown > 0) {
            overall = ComplianceOverallStatus.PARTIAL;
        } else {
            overall = ComplianceOverallStatus.ALL_PASS;
        }

        ComplianceAutomatedSummary summary = ComplianceAutomatedSummary.builder()
                .automatedRules(automated)
                .pass(pass)
                .fail(fail)
                .unknown(unknown)
                .informationalRules(informational)
                .build();

        return ComplianceEvaluateResponse.builder()
                .frameworksEvaluated(frameworks.stream().sorted().toList())
                .summary(summary)
                .overallAutomatedStatus(overall)
                .disclaimer(DISCLAIMER)
                .results(results)
                .build();
    }

    public static Set<String> normalizeFrameworks(Collection<String> raw) {
        Set<String> out = new LinkedHashSet<>();
        for (String s : raw) {
            if (s == null || s.isBlank()) {
                continue;
            }
            String u = s.trim().toUpperCase(Locale.ROOT);
            if ("HIPAA".equals(u)) {
                out.add("HIPAA");
            } else if ("GDPR".equals(u)) {
                out.add("GDPR");
            } else {
                throw new IllegalArgumentException("Unknown framework: " + s + ". Use HIPAA and/or GDPR.");
            }
        }
        if (out.isEmpty()) {
            throw new IllegalArgumentException("At least one framework (HIPAA, GDPR) is required.");
        }
        return out;
    }

    private static ComplianceRuleEvalResultDTO resultRow(
            ComplianceCatalogRuleEntity r,
            ComplianceEvalStatus status,
            String detail
    ) {
        return ComplianceRuleEvalResultDTO.builder()
                .framework(r.getFramework())
                .ruleCode(r.getRuleCode())
                .legalReference(r.getLegalReference())
                .category(r.getCategory())
                .title(r.getTitle())
                .evidenceKey(r.getEvidenceKey())
                .automated(true)
                .status(status)
                .detail(detail)
                .build();
    }

    private static ComplianceCatalogRuleDTO toDto(ComplianceCatalogRuleEntity r) {
        return ComplianceCatalogRuleDTO.builder()
                .framework(r.getFramework())
                .ruleCode(r.getRuleCode())
                .legalReference(r.getLegalReference())
                .category(r.getCategory())
                .title(r.getTitle())
                .requirementType(r.getRequirementType())
                .description(r.getDescription())
                .evidenceKey(r.getEvidenceKey())
                .automated(r.isAutomated())
                .sortOrder(r.getSortOrder())
                .build();
    }

    private static boolean isTruthy(Object raw) {
        if (raw instanceof Boolean b) {
            return b;
        }
        if (raw instanceof Number n) {
            return n.intValue() != 0;
        }
        String s = String.valueOf(raw).trim().toLowerCase(Locale.ROOT);
        return s.equals("true") || s.equals("yes") || s.equals("1");
    }
}
