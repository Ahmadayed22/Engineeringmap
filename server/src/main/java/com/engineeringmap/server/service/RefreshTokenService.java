package com.engineeringmap.server.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.engineeringmap.server.entity.RefreshToken;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.repo.RefreshTokenRepo;
import com.engineeringmap.server.repo.UserRepo;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class RefreshTokenService {
    
    @Value("${jwt.refresh.expiration:604800000}") // 7 days default
    private long refreshTokenDurationMs;

    private final RefreshTokenRepo refreshTokenRepo;
    private final UserRepo userRepo;

    public RefreshTokenService(RefreshTokenRepo refreshTokenRepo, UserRepo userRepo) {
        this.refreshTokenRepo = refreshTokenRepo;
        this.userRepo = userRepo;
    }

    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete existing refresh token for this user
        refreshTokenRepo.findByUser(user).ifPresent(existingToken -> {
            refreshTokenRepo.delete(existingToken);
           refreshTokenRepo.flush();
        });

        RefreshToken refreshToken = new RefreshToken(
                UUID.randomUUID().toString(),
                Instant.now().plusMillis(refreshTokenDurationMs),
                user
        );

        return refreshTokenRepo.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepo.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepo.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenRepo.deleteByUser(user);
    }

    @Scheduled(fixedRate = 86400000) // Run daily
    public void deleteExpiredTokens() {
        refreshTokenRepo.deleteAllExpiredTokens(Instant.now());
    }
}