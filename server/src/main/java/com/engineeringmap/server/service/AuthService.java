package com.engineeringmap.server.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.engineeringmap.server.dto.request.LoginRequest;
import com.engineeringmap.server.dto.request.SignInRequest;
import com.engineeringmap.server.dto.response.LoginResponse;
import com.engineeringmap.server.dto.response.UserInfo;
import com.engineeringmap.server.dto.response.UserResponse;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.mapper.UserMapper;
import com.engineeringmap.server.repo.UserRepo;
import com.engineeringmap.server.security.jwt.JwtUtil;
import com.engineeringmap.server.util.PasswordEncoderUtil;

import org.springframework.transaction.annotation.Transactional;



@Service
public class AuthService {
    
    private final UserRepo userRepo;


    private final JwtUtil jwtUtil;

    public AuthService(UserRepo userRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
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
    // boolean passwordMatches = PasswordEncoderUtil.matches(loginRequest.password(), user.getPassword());

    // if (!passwordMatches) {
    //     throw new RuntimeException("Invalid password.");
    String token = jwtUtil.generateToken(user.getUsername());
    UserInfo userInfo = new UserInfo(user.getId(), user.getUsername(), user.getEmail());

    return new LoginResponse(userInfo, token);

}
}
