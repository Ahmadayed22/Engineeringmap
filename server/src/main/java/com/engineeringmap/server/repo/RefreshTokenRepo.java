package com.engineeringmap.server.repo;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.RefreshToken;
import com.engineeringmap.server.entity.User;

public interface RefreshTokenRepo  extends JpaRepository<RefreshToken,Long>{

    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);
    void deleteByUser(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate <= :now")
    void deleteAllExpiredTokens(@Param("now") Instant now);
} 