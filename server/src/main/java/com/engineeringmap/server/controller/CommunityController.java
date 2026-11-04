package com.engineeringmap.server.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.engineeringmap.server.dto.CommunityDto;
import com.engineeringmap.server.dto.CommunityDto.NotificationResponse;
import com.engineeringmap.server.dto.CommunityDto.PlanItem;
import com.engineeringmap.server.dto.CommunityDto.RatingSummary;
import com.engineeringmap.server.dto.CommunityDto.ReportResponse;
import com.engineeringmap.server.dto.CommunityDto.SharedProgress;
import com.engineeringmap.server.dto.response.SuccessResponse;
import com.engineeringmap.server.security.UserDetailsImpl;
import com.engineeringmap.server.service.AdminService;
import com.engineeringmap.server.service.CourseRatingService;
import com.engineeringmap.server.service.NotificationService;
import com.engineeringmap.server.service.PlannerService;
import com.engineeringmap.server.service.ShareService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;

/**
 * Endpoints for course ratings, notifications, the semester planner, progress sharing and
 * the admin moderation queue. Access rules are in SecurityConfig.
 */
@RestController
@RequestMapping("/api")
@Validated
public class CommunityController {

    private final CourseRatingService ratingService;
    private final NotificationService notificationService;
    private final PlannerService plannerService;
    private final ShareService shareService;
    private final AdminService adminService;

    public CommunityController(CourseRatingService ratingService, NotificationService notificationService,
            PlannerService plannerService, ShareService shareService, AdminService adminService) {
        this.ratingService = ratingService;
        this.notificationService = notificationService;
        this.plannerService = plannerService;
        this.shareService = shareService;
        this.adminService = adminService;
    }

    private static Long idOf(UserDetailsImpl user) {
        return user == null ? null : user.getId();
    }

    // ----- Course difficulty ratings -----
    @GetMapping("/courses/{courseId}/ratings")
    public RatingSummary ratings(@PathVariable Long courseId, @AuthenticationPrincipal UserDetailsImpl user) {
        return ratingService.summary(courseId, idOf(user));
    }

    @PutMapping("/courses/{courseId}/rating")
    public RatingSummary rate(@PathVariable Long courseId, @Valid @RequestBody CommunityDto.RatingRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ratingService.rate(courseId, user.getId(), request);
    }

    // ----- Notifications -----
    @GetMapping("/notifications")
    public List<NotificationResponse> notifications(@AuthenticationPrincipal UserDetailsImpl user) {
        return notificationService.latest(user.getId());
    }

    @GetMapping("/notifications/unread-count")
    public CommunityDto.UnreadCount unread(@AuthenticationPrincipal UserDetailsImpl user) {
        return new CommunityDto.UnreadCount(notificationService.unreadCount(user.getId()));
    }

    @PostMapping("/notifications/read-all")
    public SuccessResponse readAll(@AuthenticationPrincipal UserDetailsImpl user) {
        notificationService.markAllRead(user.getId());
        return new SuccessResponse("All caught up");
    }

    @PostMapping("/notifications/{id}/read")
    public SuccessResponse read(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        notificationService.markRead(id, user.getId());
        return new SuccessResponse("Marked as read");
    }

    // ----- Semester planner -----
    @GetMapping("/planner")
    public List<PlanItem> plan(@RequestParam @Pattern(regexp = CommunityDto.PLAN_PATTERN) String plan,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return plannerService.get(user.getId(), plan);
    }

    @PutMapping("/planner")
    public List<PlanItem> savePlan(@RequestParam @Pattern(regexp = CommunityDto.PLAN_PATTERN) String plan,
            @Valid @RequestBody CommunityDto.PlanRequest request, @AuthenticationPrincipal UserDetailsImpl user) {
        return plannerService.replace(user.getId(), plan, request.items());
    }

    // ----- Sharing progress -----
    @GetMapping("/users/me/share")
    public CommunityDto.ShareLinkResponse myShare(@AuthenticationPrincipal UserDetailsImpl user) {
        return new CommunityDto.ShareLinkResponse(shareService.current(user.getId()).orElse(null));
    }

    @PostMapping("/users/me/share")
    public CommunityDto.ShareLinkResponse enableShare(@AuthenticationPrincipal UserDetailsImpl user) {
        return new CommunityDto.ShareLinkResponse(shareService.enable(user.getId()));
    }

    @DeleteMapping("/users/me/share")
    public ResponseEntity<Void> disableShare(@AuthenticationPrincipal UserDetailsImpl user) {
        shareService.disable(user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/share/{token}")
    public SharedProgress shared(@PathVariable @Pattern(regexp = "^[A-Za-z0-9_-]{8,64}$") String token) {
        return shareService.view(token);
    }

    // ----- Admin moderation -----
    @GetMapping("/admin/reports")
    public List<ReportResponse> reports() {
        return adminService.openReports();
    }

    @PostMapping("/admin/reports/{id}/resolve")
    public SuccessResponse resolve(@PathVariable Long id) {
        adminService.resolve(id);
        return new SuccessResponse("Report resolved");
    }
}
