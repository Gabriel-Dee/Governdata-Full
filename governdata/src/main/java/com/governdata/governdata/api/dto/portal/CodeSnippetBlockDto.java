package com.governdata.governdata.api.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeSnippetBlockDto {
    /** Stable id for UI tabs: `policy-hipaa`, `policy-gdpr`, `audit-ingest`. */
    private String id;
    private String title;
    private String description;
    /** Copy-paste shell example; replace `YOUR_API_KEY` with a key from the dashboard. */
    private String curl;
}
