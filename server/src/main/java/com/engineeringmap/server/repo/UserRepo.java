package com.engineeringmap.server.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.engineeringmap.server.entity.User;
public interface UserRepo  extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    
} 