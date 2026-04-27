package com.governdata.ehr_emr_be.auth;

import com.governdata.ehr_emr_be.audit.AuditActions;
import com.governdata.ehr_emr_be.audit.AuditRecordingService;
import com.governdata.ehr_emr_be.audit.AuditResourceTypes;
import com.governdata.ehr_emr_be.security.JwtTokenService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final AuditRecordingService auditRecordingService;

    public AuthService(UserAccountRepository userAccountRepository,
                       UserAuthorizationRepository userAuthorizationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService,
                       AuditRecordingService auditRecordingService) {
        this.userAccountRepository = userAccountRepository;
        this.userAuthorizationRepository = userAuthorizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.auditRecordingService = auditRecordingService;
    }

    public LoginResponse login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByUsernameIgnoreCase(request.username())
                .filter(UserAccount::isActive)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        List<String> roles = userAuthorizationRepository.findRoleCodes(user.getId())
                .stream()
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();
        List<String> permissions = userAuthorizationRepository.findPermissionCodes(user.getId())
                .stream()
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();

        String token = jwtTokenService.issueToken(user.getId(), user.getUsername(), roles, permissions);
        auditRecordingService.recordForActor(
                user.getId(),
                AuditActions.LOGIN,
                AuditResourceTypes.AUTH,
                user.getId(),
                null,
                null,
                null);
        return new LoginResponse(
                token,
                "Bearer",
                jwtTokenService.getExpirationSeconds(),
                user.getId(),
                user.getUsername(),
                roles,
                permissions
        );
    }
}
