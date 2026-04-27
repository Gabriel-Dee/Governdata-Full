package com.governdata.governdata.api.dto.compliance;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class ComplianceEvaluateResponse {
    List<String> frameworksEvaluated;
    ComplianceAutomatedSummary summary;
    ComplianceOverallStatus overallAutomatedStatus;
    String disclaimer;
    List<ComplianceRuleEvalResultDTO> results;
}
