package com.governdata.governdata.api.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeSnippetsResponse {
    private String publicBaseUrl;
    private String apiKeyPlaceholder;
    private CodeSnippetBlockDto policyHipaa;
    private CodeSnippetBlockDto policyGdpr;
    private CodeSnippetBlockDto auditIngest;
}
