package com.engineeringmap.server.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.engineeringmap.server.entity.RefreshToken;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.repo.RefreshTokenRepo;
import com.engineeringmap.server.repo.UserRepo;

import jakarta.transaction.Transactional;

/**
 * Refresh tokens, one per sign-in. A user signed in on a phone and a laptop has two tokens,
 * and signing out on one device revokes only that device's token.
 */
@Service
@Transactional
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    /** Sign-ins kept per user; signing in again beyond this drops the oldest one. */
    static final int MAX_TOKENS_PER_USER = 10;

    @Value("${jwt.refresh.expiration:604800000}") // 7 days default
    private long refreshTokenDurationMs;

    private final RefreshTokenRepo refreshTokenRepo;
    private final UserRepo userRepo;

    public RefreshTokenService(RefreshTokenRepo refreshTokenRepo, UserRepo userRepo) {
        this.refreshTokenRepo = refreshTokenRepo;
        this.userRepo = userRepo;
    }

    /** A new token for a new sign-in. The user's other sign-ins stay valid. */
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        refreshTokenRepo.deleteExpiredByUser(user, Instant.now());
        List<RefreshToken> existing = refreshTokenRepo.findByUserOrderByExpiryDateDescIdDesc(user);
        if (existing.size() >= MAX_TOKENS_PER_USER) {
            // Keep the newest MAX - 1 so there is room for this one.
            refreshTokenRepo.deleteAll(existing.subList(MAX_TOKENS_PER_USER - 1, existing.size()));
            refreshTokenRepo.flush();
        }

        RefreshToken refreshToken = new RefreshToken(
                UUID.randomUUID().toString(),
                Instant.now().plusMillis(refreshTokenDurationMs),
                user
        );

        return refreshTokenRepo.save(refreshToken);
    }

    /** The token if it exists and has not expired. An expired token is deleted. */
    public Optional<RefreshToken> findValidToken(String token) {
        return refreshTokenRepo.findByToken(token).filter(rt -> {
            if (rt.getExpiryDate().isAfter(Instant.now())) {
                return true;
            }
            refreshTokenRepo.delete(rt);
            return false;
        });
    }

    /** Revokes one sign-in of this user. Unknown tokens and other users' tokens are ignored. */
    public void revoke(String token, Long userId) {
        refreshTokenRepo.deleteByTokenAndUserId(token, userId);
    }

    @Scheduled(fixedRate = 86400000) // Run daily
    public void deleteExpiredTokens() {
        int deleted = refreshTokenRepo.deleteAllExpiredTokens(Instant.now());
        if (deleted > 0) {
            log.info("Deleted {} expired refresh tokens", deleted);
        }
    }
}
