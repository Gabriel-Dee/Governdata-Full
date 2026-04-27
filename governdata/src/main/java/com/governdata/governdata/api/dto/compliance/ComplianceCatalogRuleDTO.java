package com.governdata.governdata.api.dto.compliance;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ComplianceCatalogRuleDTO {
    String framework;
    String ruleCode;
    String legalReference;
    String category;
    String title;
    String requirementType;
    String description;
    String evidenceKey;
    boolean automated;
    int sortOrder;
}
