package com.engineeringmap.server.service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.CommunityDto.SharedProgress;
import com.engineeringmap.server.entity.ShareLink;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.ShareLinkRepo;
import com.engineeringmap.server.repo.TrackingRepo;
import com.engineeringmap.server.repo.UserRepo;

/**
 * Opt-in, revocable public links. A shared view exposes only the username and which
 * courses are completed: never email, grades or comments.
 */
@Service
@Transactional
public class ShareService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final ShareLinkRepo shareRepo;
    private final UserRepo userRepo;
    private final TrackingRepo trackingRepo;

    public ShareService(ShareLinkRepo shareRepo, UserRepo userRepo, TrackingRepo trackingRepo) {
        this.shareRepo = shareRepo;
        this.userRepo = userRepo;
        this.trackingRepo = trackingRepo;
    }

    @Transactional(readOnly = true)
    public Optional<String> current(Long userId) {
        return shareRepo.findByUserId(userId).map(ShareLink::getToken);
    }

    /** Returns the existing token or creates one. */
    public String enable(Long userId) {
        return shareRepo.findByUserId(userId).map(ShareLink::getToken).orElseGet(() -> {
            ShareLink link = new ShareLink();
            link.setUser(userRepo.getReferenceById(userId));
            link.setToken(newToken());
            return shareRepo.save(link).getToken();
        });
    }

    public void disable(Long userId) {
        shareRepo.findByUserId(userId).ifPresent(shareRepo::delete);
    }

    @Transactional(readOnly = true)
    public SharedProgress view(String token) {
        ShareLink link = shareRepo.findByTokenWithUser(token)
                .orElseThrow(() -> new ResourceNotFoundException("This share link doesn't exist or was turned off"));
        var completed = trackingRepo.findByUserIdAndCompleted(link.getUser().getId(), true).stream()
                .map(t -> t.getCourse().getId())
                .toList();
        return new SharedProgress(link.getUser().getUsername(), completed);
    }

    private static String newToken() {
        byte[] bytes = new byte[18];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
