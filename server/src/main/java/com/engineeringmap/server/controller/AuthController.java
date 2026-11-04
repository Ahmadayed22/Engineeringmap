package com.engineeringmap.server.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.engineeringmap.server.dto.request.LoginRequest;
import com.engineeringmap.server.dto.request.RefreshTokenRequest;
import com.engineeringmap.server.dto.request.SignInRequest;
import com.engineeringmap.server.dto.response.ErrorResponse;
import com.engineeringmap.server.dto.response.LoginResponse;
import com.engineeringmap.server.dto.response.SuccessResponse;
import com.engineeringmap.server.dto.response.UserResponse;
import com.engineeringmap.server.security.UserDetailsImpl;
import com.engineeringmap.server.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody @Valid SignInRequest signInRequest) {
        try {
            UserResponse user = authService.createUser(signInRequest);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // Same message for unknown email and wrong password, so accounts can't be probed.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            LoginResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Your session has expired. Please sign in again."));
        }
    }

    /**
     * Signs out the calling device by revoking the refresh token in the body. The user's other
     * devices stay signed in. Without a body nothing is revoked (the token expires on its own).
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody(required = false) RefreshTokenRequest request) {
        authService.logout(userDetails.getId(), request == null ? null : request.refreshToken());
        log.debug("User {} logged out", userDetails.getId());
        return ResponseEntity.ok(new SuccessResponse("Logged out successfully"));
    }
}
