package com.engineeringmap.server.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.ShareLink;

public interface ShareLinkRepo extends JpaRepository<ShareLink, Long> {

    Optional<ShareLink> findByUserId(Long userId);

    @Query("SELECT s FROM ShareLink s JOIN FETCH s.user WHERE s.token = :token")
    Optional<ShareLink> findByTokenWithUser(@Param("token") String token);
}
