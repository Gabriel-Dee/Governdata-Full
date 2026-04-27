package com.governdata.governdata.api.dto.compliance;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ComplianceAutomatedSummary {
    int automatedRules;
    int pass;
    int fail;
    int unknown;
    int informationalRules;
}
