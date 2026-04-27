package com.governdata.ehr_emr_be.config;

import com.governdata.ehr_emr_be.governance.GovernanceClientProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GovernanceClientConfig {

    @Bean
    public RestTemplate governanceRestTemplate(GovernanceClientProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(java.time.Duration.ofMillis(properties.getTimeoutMs()));
        factory.setReadTimeout(java.time.Duration.ofMillis(properties.getTimeoutMs()));
        return new RestTemplate(factory);
    }
}
