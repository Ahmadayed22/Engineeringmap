package com.engineeringmap.server.service;

import org.springframework.security.access.AccessDeniedException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.CommunityDto.ReportRequest;
import com.engineeringmap.server.dto.CommunityDto.VoteResponse;
import com.engineeringmap.server.dto.StudyToolsDto.PendingMaterial;
import com.engineeringmap.server.dto.request.ResourceRequestDto;
import com.engineeringmap.server.dto.response.ResouceResponseDto;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.Notification;
import com.engineeringmap.server.entity.Resource;
import com.engineeringmap.server.entity.ResourceReport;
import com.engineeringmap.server.entity.ResourceVote;
import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.mapper.ResourceMapper;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.ResourceReportRepo;
import com.engineeringmap.server.repo.ResourceRepo;
import com.engineeringmap.server.repo.ResourceVoteRepo;
import com.engineeringmap.server.repo.UserRepo;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepo resourceRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;
    private final ResourceVoteRepo voteRepo;
    private final ResourceReportRepo reportRepo;
    private final NotificationService notifications;

    public ResourceService(ResourceRepo resourceRepo, CourseRepo courseRepo, UserRepo userRepo,
            ResourceVoteRepo voteRepo, ResourceReportRepo reportRepo, NotificationService notifications) {
        this.notifications = notifications;
        this.resourceRepo = resourceRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.voteRepo = voteRepo;
        this.reportRepo = reportRepo;
    }

    /** A material; one still waiting for review is only shown to its author and admins. */
    @Transactional(readOnly = true)
    public ResouceResponseDto getResourceById(Long id, Long viewerId, boolean viewerIsAdmin) {
        Resource resource = resourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        if (!resource.isApproved() && !viewerIsAdmin && !resource.getUser().getId().equals(viewerId)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        return ResourceMapper.toDto(resource);
    }

    /**
     * Approved materials with their vote score; {@code viewerId} (nullable) also gets their own
     * vote and their own materials that still wait for review.
     */
    @Transactional(readOnly = true)
    public List<ResouceResponseDto> getResourceByCourseId(Long courseId, Long viewerId) {
        List<Resource> resources = resourceRepo.visibleForCourse(courseId, viewerId);
        Map<Long, Long> scores = new HashMap<>();
        for (Object[] row : voteRepo.scoresForCourse(courseId)) {
            scores.put((Long) row[0], ((Number) row[1]).longValue());
        }
        Map<Long, Integer> mine = new HashMap<>();
        if (viewerId != null) {
            voteRepo.userVotesForCourse(courseId, viewerId)
                    .forEach(v -> mine.put(v.getResource().getId(), v.getValue()));
        }
        return resources.stream()
            .map(r -> ResourceMapper.toDto(r, scores.getOrDefault(r.getId(), 0L), mine.getOrDefault(r.getId(), 0)))
            .toList();
    }

    /** Up (+1), down (-1) or clear (0) the caller's vote on a material. */
    public VoteResponse vote(Long resourceId, Long userId, int value) {
        Resource resource = approvedMaterial(resourceId);
        var existing = voteRepo.findByResourceIdAndUserId(resourceId, userId);
        if (value == 0) {
            existing.ifPresent(voteRepo::delete);
        } else if (existing.isPresent()) {
            existing.get().setValue(value);
        } else {
            User user = userRepo.getReferenceById(userId);
            voteRepo.save(new ResourceVote(resource, user, value));
        }
        voteRepo.flush();
        return new VoteResponse(resourceId, voteRepo.scoreFor(resourceId), value);
    }

    /** Flag a material for admin review. One open report per student per material. */
    public void report(Long resourceId, Long userId, ReportRequest request) {
        Resource resource = approvedMaterial(resourceId);
        if (reportRepo.existsByResourceIdAndReporterIdAndResolvedFalse(resourceId, userId)) {
            throw new IllegalArgumentException("You already reported this material. An admin will review it.");
        }
        reportRepo.save(new ResourceReport(resource, userRepo.getReferenceById(userId), request.reason().trim()));
    }

public ResouceResponseDto createResourceByCourseId(ResourceRequestDto dto, Long courseId, Long userId) {
        Course course = courseRepo.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Resource resource = ResourceMapper.toEntity(dto, course, user);
        resource.setApproved(isAdmin(user));
        Resource saved = resourceRepo.save(resource);
        return ResourceMapper.toDto(saved);
    }

    public ResouceResponseDto updateResourceByCourseId(ResourceRequestDto dto, Long id,Long userId) {
        Resource resource = resourceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
            
        if (!resource.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own material");
        }

        ResourceMapper.updateEntity(resource, dto );
        // A changed link needs a fresh review, or approval could be dodged by editing afterwards.
        if (!isAdmin(resource.getUser())) {
            resource.setApproved(false);
        }
        Resource updated = resourceRepo.save(resource);
        return ResourceMapper.toDto(updated);
    }

    public void deleteResourceById(Long id, Long userId) {
         // Ensure the user is authorized to delete the resource
        Resource resource = resourceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user not found with id: " + userId));
                
        if (!isAdmin(user) && !resource.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own material");
        }
   
        resourceRepo.delete(resource);
    }

    // ----- Admin review of new materials -----
    @Transactional(readOnly = true)
    public List<PendingMaterial> pending() {
        return resourceRepo.pending().stream()
                .map(r -> {
                    String[] link = firstLink(r);
                    return new PendingMaterial(r.getId(), r.getCourse().getId(), r.getCourse().getLabel(),
                            r.getName(), link[0], link[1], r.getUser().getUsername());
                })
                .toList();
    }

    public void approve(Long id) {
        Resource resource = resourceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
        if (resource.isApproved()) {
            return;
        }
        resource.setApproved(true);
        notifications.notify(resource.getUser(), Notification.MATERIAL_APPROVED, label(resource),
                resource.getCourse().getId());
    }

    /** Deletes a waiting material and tells its author. */
    public void reject(Long id) {
        Resource resource = resourceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
        notifications.notify(resource.getUser(), Notification.MATERIAL_REJECTED, label(resource),
                resource.getCourse().getId());
        resourceRepo.delete(resource);
    }

    private Resource approvedMaterial(Long id) {
        return resourceRepo.findById(id).filter(Resource::isApproved)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
    }

    private static boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName() == RoleType.ADMIN);
    }

    private static String label(Resource r) {
        return r.getName() != null && !r.getName().isBlank() ? r.getName() : r.getCourse().getLabel();
    }

    /** {category, url} of the one link a material holds. */
    private static String[] firstLink(Resource r) {
        String[][] all = {{"books", r.getBooks()}, {"summaries", r.getSummaries()}, {"slides", r.getSlides()},
                {"labs", r.getLabs()}, {"exams", r.getExams()}, {"videos", r.getVideos()}};
        for (String[] c : all) {
            if (c[1] != null && !c[1].isBlank()) {
                return c;
            }
        }
        return new String[] {"", ""};
    }
}
