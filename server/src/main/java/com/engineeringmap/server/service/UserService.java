package com.engineeringmap.server.service;

import org.springframework.stereotype.Service;

import com.engineeringmap.server.dto.response.UserResponse;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.mapper.UserMapper;
import com.engineeringmap.server.repo.UserRepo;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepo userRepo;

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }
    // @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserMapper.toResponseDto(user);
    }
    
}
