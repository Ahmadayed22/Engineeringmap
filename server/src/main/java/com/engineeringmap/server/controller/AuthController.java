package com.engineeringmap.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import com.engineeringmap.server.dto.request.LoginRequest;
import com.engineeringmap.server.dto.request.RefreshTokenRequest;
import com.engineeringmap.server.dto.request.SignInRequest;
import com.engineeringmap.server.dto.response.LoginResponse;
import com.engineeringmap.server.dto.response.UserResponse;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.repo.UserRepo;
import com.engineeringmap.server.security.jwt.JwtUtil;
import com.engineeringmap.server.service.AuthService;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepo userRepo;
   public AuthController(AuthService authService, JwtUtil jwtUtil, UserRepo userRepo) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signIn(@RequestBody @Valid SignInRequest signInRequest) {

        try {
            UserResponse user = authService.createUser(signInRequest);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
    
   @PostMapping("/signin")
   public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
       try {
           LoginResponse response = authService.login(loginRequest);
           return ResponseEntity.ok(response);
       } catch (Exception e) {
        e.printStackTrace(); 
           return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
       }
   }
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            LoginResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Refresh failed: " + e.getMessage());
        }
    }
     @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                // Validate token first
                if (!jwtUtil.isTokenValid(token)) {
                    return ResponseEntity.status(401).body("Invalid or expired token");
                }
                
                String username = jwtUtil.extractUsername(token);
                User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                
                authService.logout(user.getId());
                return ResponseEntity.ok().body("Logged out successfully");
            }
            return ResponseEntity.badRequest().body("Authorization header missing or invalid");
        } catch (Exception e) {
            e.printStackTrace(); // Add this for debugging
            return ResponseEntity.badRequest().body("Logout failed: " + e.getMessage());
        }
    
    }
}
