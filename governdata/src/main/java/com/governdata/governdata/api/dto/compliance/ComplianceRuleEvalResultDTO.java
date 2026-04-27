package com.governdata.governdata.api.dto.compliance;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ComplianceRuleEvalResultDTO {
    String framework;
    String ruleCode;
    String legalReference;
    String category;
    String title;
    String evidenceKey;
    boolean automated;
    ComplianceEvalStatus status;
    String detail;
}
