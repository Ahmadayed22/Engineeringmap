package com.engineeringmap.server.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.engineeringmap.server.dto.request.LoginRequest;
import com.engineeringmap.server.dto.request.RefreshTokenRequest;
import com.engineeringmap.server.dto.request.SignInRequest;
import com.engineeringmap.server.dto.response.LoginResponse;
import com.engineeringmap.server.dto.response.UserInfo;
import com.engineeringmap.server.dto.response.UserResponse;
import com.engineeringmap.server.entity.RefreshToken;
import com.engineeringmap.server.entity.Role;
import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.mapper.UserMapper;
import com.engineeringmap.server.repo.RoleRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.engineeringmap.server.security.jwt.JwtUtil;
import com.engineeringmap.server.util.PasswordEncoderUtil;

import org.springframework.transaction.annotation.Transactional;



@Service
public class AuthService {
    
    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;
    private final RoleRepo roleRepo;
     private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepo userRepo, JwtUtil jwtUtil, RoleRepo roleRepo , RefreshTokenService refreshTokenService) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.roleRepo = roleRepo;
        this.refreshTokenService = refreshTokenService;
    }
        // This method handles user registration
        // It checks if the email or username already exists, encodes the password, and saves
    @Transactional
    public UserResponse createUser(SignInRequest signInRequest) {
        if (userRepo.existsByEmail(signInRequest.email())) {
            throw new RuntimeException("Email already exists!");
        }
        if (userRepo.existsByUsername(signInRequest.username())) {
            throw new RuntimeException("Username already exists!");
        }

        // Convert SignInRequest to User entity and save it
        User user = UserMapper.toEntity(signInRequest);
          // Add default role assignment
        Role defaultRole = roleRepo.findByName(RoleType.USER)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRoles(Set.of(defaultRole)); // assign role
        User savedUser = userRepo.save(user);

        return new UserResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail());
    }
    
// This method handles user login
// It checks if the user exists by email, verifies the password, and returns a response
public LoginResponse login(LoginRequest loginRequest) {
    Optional<User> optionalUser = userRepo.findByEmail(loginRequest.email());
    if (optionalUser.isEmpty()) {
        throw new RuntimeException("User not found.");
    }

    User user = optionalUser.get();
    boolean passwordMatches = PasswordEncoderUtil.matches(loginRequest.password(), user.getPassword());

    if (!passwordMatches) {
        throw new RuntimeException("Invalid password.");
    }
    String token = jwtUtil.generateToken(user);
    RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
    UserInfo userInfo = new UserInfo(user.getId(), user.getUsername(), user.getEmail());

    return new LoginResponse(userInfo, token, refreshToken.getToken());

}
   public LoginResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.refreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtUtil.generateToken(user);
                    UserInfo userInfo = new UserInfo(user.getId(), user.getUsername(), user.getEmail());
                    return new LoginResponse(userInfo, accessToken, requestRefreshToken);
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
    
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }
    
}
