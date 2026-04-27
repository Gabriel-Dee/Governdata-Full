package com.governdata.governdata.api.controller;

import com.governdata.governdata.api.dto.compliance.ComplianceCatalogRuleDTO;
import com.governdata.governdata.api.dto.compliance.ComplianceEvaluateRequest;
import com.governdata.governdata.api.dto.compliance.ComplianceEvaluateResponse;
import com.governdata.governdata.service.compliance.ComplianceCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/compliance")
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceCatalogService complianceCatalogService;

    /**
     * List seeded compliance catalog rules. Query {@code framework}=HIPAA, GDPR, or ALL (default ALL).
     */
    @GetMapping(value = "/catalog", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ComplianceCatalogRuleDTO>> catalog(
            @RequestParam(name = "framework", defaultValue = "ALL") String framework
    ) {
        Set<String> frameworks = parseFrameworkQuery(framework);
        return ResponseEntity.ok(complianceCatalogService.listCatalog(frameworks));
    }

    /**
     * Evaluate submitted evidence against all automated rules in the selected framework(s).
     * Separate from {@code /authorize}: this is organizational/technical control attestation;
     * {@code /authorize} remains for request-time ABAC/policy decisions.
     */
    @PostMapping(value = "/evaluate", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ComplianceEvaluateResponse> evaluate(@Valid @RequestBody ComplianceEvaluateRequest request) {
        return ResponseEntity.ok(complianceCatalogService.evaluate(request));
    }

    private static Set<String> parseFrameworkQuery(String framework) {
        if (framework == null || framework.isBlank() || "ALL".equalsIgnoreCase(framework.trim())) {
            return Set.of("HIPAA", "GDPR");
        }
        return ComplianceCatalogService.normalizeFrameworks(List.of(framework.trim()));
    }
}
