package com.engineeringmap.server.service;

import org.springframework.security.access.AccessDeniedException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.CommunityDto.ReportRequest;
import com.engineeringmap.server.dto.CommunityDto.VoteResponse;
import com.engineeringmap.server.dto.request.ResourceRequestDto;
import com.engineeringmap.server.dto.response.ResouceResponseDto;
import com.engineeringmap.server.entity.Course;
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

    public ResourceService(ResourceRepo resourceRepo, CourseRepo courseRepo, UserRepo userRepo,
            ResourceVoteRepo voteRepo, ResourceReportRepo reportRepo) {
        this.resourceRepo = resourceRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.voteRepo = voteRepo;
        this.reportRepo = reportRepo;
    }

    public ResouceResponseDto getResourceById(Long id) {
        Resource resource = resourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return ResourceMapper.toDto(resource);
    }

    public List<ResouceResponseDto> getResourceByCourseId(Long courseId) {
        return getResourceByCourseId(courseId, null);
    }

    /** Materials with their vote score; {@code viewerId} (nullable) gets their own vote too. */
    @Transactional(readOnly = true)
    public List<ResouceResponseDto> getResourceByCourseId(Long courseId, Long viewerId) {
        List<Resource> resources = resourceRepo.findByCourseId(courseId);
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
        Resource resource = resourceRepo.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
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
        Resource resource = resourceRepo.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
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
        Resource updated = resourceRepo.save(resource);
        return ResourceMapper.toDto(updated);
    }

    public void deleteResourceById(Long id, Long userId) {
         // Ensure the user is authorized to delete the resource
        Resource resource = resourceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user not found with id: " + userId));
                
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleType.ADMIN);

        if (!isAdmin && !resource.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own material");
        }
   
        resourceRepo.delete(resource);
    }
}
