package com.governdata.ehr_emr_be.config;

import com.governdata.ehr_emr_be.security.CallerIdentityFilter;
import com.governdata.ehr_emr_be.security.JwtAuthenticationFilter;
import com.governdata.ehr_emr_be.security.JwtProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    private final CallerIdentityFilter callerIdentityFilter;
    private final JwtProperties jwtProperties;

    public SecurityConfig(CallerIdentityFilter callerIdentityFilter, JwtProperties jwtProperties) {
        this.callerIdentityFilter = callerIdentityFilter;
        this.jwtProperties = jwtProperties;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtProperties);
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/actuator/**").permitAll();
                    auth.requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll();
                    auth.requestMatchers("/api/v1/auth/login").permitAll();
                    // PathPattern matcher: require auth for every path under /api/v1 (not MVC-handler-only).
                    // With the default MVC request matcher, unmapped methods or missing handlers can skip
                    // /api/v1/** and hit anyRequest().denyAll(), surfacing as 401 even with a valid Bearer token.
                    auth.requestMatchers(PathPatternRequestMatcher.withDefaults().matcher("/api/v1/**")).authenticated();
                    auth.anyRequest().denyAll();
                })
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED)))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(callerIdentityFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new RequestLoggingFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
