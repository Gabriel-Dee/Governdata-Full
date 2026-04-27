package com.governdata.governdata.api.dto.compliance;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class ComplianceEvaluateRequest {

    /**
     * One or both of HIPAA, GDPR (case-insensitive). Controls which catalog rows are evaluated.
     */
    @NotEmpty
    private List<String> frameworks;

    /**
     * Evidence flags keyed by {@code evidence_key} from the catalog (boolean true = control asserted implemented).
     * Keys are matched case-insensitively.
     */
    private Map<String, Object> evidence = new HashMap<>();
}
