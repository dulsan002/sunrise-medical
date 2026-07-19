package com.sunrisedental.service;

import com.sunrisedental.dto.request.LoginRequest;
import com.sunrisedental.dto.response.AuthResponse;
import com.sunrisedental.entity.User;
import com.sunrisedental.entity.enums.AuditAction;
import com.sunrisedental.repository.UserRepository;
import com.sunrisedental.security.JwtTokenProvider;
import com.sunrisedental.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Transactional
    public AuthResponse authenticate(LoginRequest loginRequest, String ipAddress) {
        String username = loginRequest.getUsername();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isActive()) {
            throw new BadCredentialsException("User account is deactivated");
        }

        if (user.isLocked()) {
            throw new LockedException("User account is locked due to multiple failed login attempts");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword())
            );

            // Reset failed login attempts on success
            user.setFailedLoginAttempts(0);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
            String jwt = tokenProvider.generateToken(authentication);

            auditLogService.log(username, AuditAction.LOGIN_SUCCESS, "User", user.getUserId(), null, null, ipAddress);

            return AuthResponse.builder()
                    .token(jwt)
                    .role(userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""))
                    .fullName(userPrincipal.getFullName())
                    .profileImageUrl(user.getProfileImageUrl())
                    .expiresIn(jwtExpirationMs / 1000)
                    .build();

        } catch (BadCredentialsException e) {
            handleFailedLogin(user, ipAddress);
            throw e;
        }
    }

    private void handleFailedLogin(User user, String ipAddress) {
        int failedAttempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(failedAttempts);
        
        if (failedAttempts >= 5) {
            user.setLocked(true);
            auditLogService.log(user.getUsername(), AuditAction.LOGIN_FAILURE, "User", user.getUserId(), 
                    "{\"isLocked\": false}", "{\"isLocked\": true, \"reason\": \"Account Locked\"}", ipAddress);
        } else {
            auditLogService.log(user.getUsername(), AuditAction.LOGIN_FAILURE, "User", user.getUserId(), 
                    "{\"failedAttempts\": " + (failedAttempts - 1) + "}", "{\"failedAttempts\": " + failedAttempts + "}", ipAddress);
        }
        
        userRepository.save(user);
    }
}
