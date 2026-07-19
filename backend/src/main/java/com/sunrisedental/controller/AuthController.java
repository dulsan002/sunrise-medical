package com.sunrisedental.controller;

import com.sunrisedental.dto.request.LoginRequest;
import com.sunrisedental.dto.response.AuthResponse;
import com.sunrisedental.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        AuthResponse response = authService.authenticate(loginRequest, ipAddress);
        return ResponseEntity.ok(response);
    }
}
