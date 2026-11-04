package com.engineeringmap.server.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.CommunityDto.NotificationResponse;
import com.engineeringmap.server.entity.Notification;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.NotificationRepo;

@Service
@Transactional
public class NotificationService {

    private static final int PAGE_SIZE = 30;

    private final NotificationRepo notificationRepo;

    public NotificationService(NotificationRepo notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    /** Tell {@code recipient} that someone replied to their comment. */
    public void notifyReply(User recipient, String replierName, Long courseId, Long replyId) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(Notification.COMMENT_REPLY);
        String name = replierName.length() > 40 ? replierName.substring(0, 40) : replierName;
        n.setMessage(name + " replied to your comment");
        n.setCourseId(courseId);
        n.setCommentId(replyId);
        notificationRepo.save(n);
    }

    /**
     * A notification whose wording the client picks from {@code type}; {@code subject} is the
     * name it fills in (a material, an exam, ...). See Notification for the types.
     */
    public void notify(User recipient, String type, String subject, Long courseId) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(type);
        String text = subject == null || subject.isBlank() ? "-" : subject.strip();
        n.setMessage(text.length() > 300 ? text.substring(0, 300) : text);
        n.setCourseId(courseId);
        notificationRepo.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> latest(Long userId) {
        return notificationRepo.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(0, PAGE_SIZE))
                .stream()
                .map(n -> new NotificationResponse(n.getId(), n.getType(), n.getMessage(), n.getCourseId(),
                        n.getCommentId(), n.isRead(), n.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepo.countByRecipientIdAndReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        notificationRepo.markAllRead(userId);
    }

    public void markRead(Long notificationId, Long userId) {
        Notification n = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new AccessDeniedException("Not your notification");
        }
        n.setRead(true);
    }

    public void deleteForComments(List<Long> commentIds) {
        if (!commentIds.isEmpty()) {
            notificationRepo.deleteByCommentIds(commentIds);
        }
    }
}
