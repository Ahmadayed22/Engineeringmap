package com.engineeringmap.server.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.engineeringmap.server.dto.StudyPlanDto;
import com.engineeringmap.server.dto.StudyPlanDto.CreateRequest;
import com.engineeringmap.server.dto.StudyPlanDto.PlanInfo;
import com.engineeringmap.server.dto.StudyPlanDto.UpdateRequest;
import com.engineeringmap.server.security.UserDetailsImpl;
import com.engineeringmap.server.service.StudyPlanService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;

/** Roadmaps. Listing is public (admins also see hidden ones); changes are under /api/admin. */
@RestController
@RequestMapping("/api")
@Validated
public class StudyPlanController {

    private final StudyPlanService planService;

    public StudyPlanController(StudyPlanService planService) {
        this.planService = planService;
    }

    /** True when the caller is a signed-in admin (public endpoints may have no user at all). */
    static boolean isAdmin(UserDetailsImpl user) {
        return user != null && user.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @GetMapping("/plans")
    public List<PlanInfo> list(@AuthenticationPrincipal UserDetailsImpl user) {
        return planService.list(isAdmin(user));
    }

    @PostMapping("/admin/plans")
    @ResponseStatus(HttpStatus.CREATED)
    public PlanInfo create(@Valid @RequestBody CreateRequest request, @AuthenticationPrincipal UserDetailsImpl admin) {
        return planService.create(request, admin.getId());
    }

    @PutMapping("/admin/plans/{slug}")
    public PlanInfo update(@PathVariable @Pattern(regexp = StudyPlanDto.SLUG_PATTERN) String slug,
            @Valid @RequestBody UpdateRequest request) {
        return planService.update(slug, request);
    }
}
