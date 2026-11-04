package com.engineeringmap.server.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request/response shapes for votes, reports, ratings, notifications, planner and sharing. */
public final class CommunityDto {
    private CommunityDto() {
    }

    // ----- Materials -----
    public record VoteRequest(@NotNull @Min(-1) @Max(1) Integer value) {
    }

    public record VoteResponse(Long resourceId, long score, int myVote) {
    }

    public record ReportRequest(@NotBlank @Size(max = 500) String reason) {
    }

    public record ReportResponse(Long id, Long resourceId, String resourceName, Long courseId,
            String courseName, String reason, String reporter, LocalDateTime createdAt) {
    }

    // ----- Course ratings -----
    public record RatingRequest(
            @NotNull @Min(1) @Max(5) Integer difficulty,
            @NotNull @Min(1) @Max(5) Integer workload) {
    }

    public record RatingSummary(Long courseId, long count, Double avgDifficulty, Double avgWorkload,
            Integer myDifficulty, Integer myWorkload) {
    }

    // ----- Notifications -----
    public record NotificationResponse(Long id, String type, String message, Long courseId,
            Long commentId, boolean read, LocalDateTime createdAt) {
    }

    public record UnreadCount(long count) {
    }

    // ----- Semester planner -----
    public record PlanItem(@NotNull Long courseId, @NotNull @Min(1) @Max(12) Integer semester) {
    }

    public record PlanRequest(@NotNull @Size(max = 120) List<@Valid PlanItem> items) {
    }

    public static final String PLAN_PATTERN = "^(cpe|ee)$";

    public record PlanKey(@Pattern(regexp = PLAN_PATTERN) String plan) {
    }

    // ----- Sharing -----
    public record ShareLinkResponse(String token) {
    }

    public record SharedProgress(String username, List<Long> completedCourseIds) {
    }
}
