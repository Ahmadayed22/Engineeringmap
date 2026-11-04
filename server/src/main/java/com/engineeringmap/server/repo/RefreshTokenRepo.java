package com.engineeringmap.server.repo;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.engineeringmap.server.entity.RefreshToken;
import com.engineeringmap.server.entity.User;

import jakarta.transaction.Transactional;

@Repository
public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    /** The user's tokens, newest first (all tokens have the same lifetime). */
    List<RefreshToken> findByUserOrderByExpiryDateDescIdDesc(User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.user = :user AND rt.expiryDate <= :now")
    int deleteExpiredByUser(@Param("user") User user, @Param("now") Instant now);

    /** Revokes one sign-in; the user check stops anyone revoking another user's token. */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.token = :token AND rt.user.id = :userId")
    int deleteByTokenAndUserId(@Param("token") String token, @Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate <= :now")
    int deleteAllExpiredTokens(@Param("now") Instant now);
}
