package com.engineeringmap.server.controller;

import java.util.List;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
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
import com.engineeringmap.server.entity.StudyPlanImage;
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

    /** Removes the roadmap (see StudyPlanService.delete for what is kept). */
    @DeleteMapping("/admin/plans/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Pattern(regexp = StudyPlanDto.SLUG_PATTERN) String slug) {
        planService.delete(slug);
    }

    /**
     * The card picture. Public (an img tag sends no token); the URL carries ?v=imageVersion,
     * so the response can be cached for a year.
     */
    @GetMapping("/plans/{slug}/image")
    public ResponseEntity<byte[]> image(@PathVariable @Pattern(regexp = StudyPlanDto.SLUG_PATTERN) String slug) {
        StudyPlanImage image = planService.image(slug);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                .body(image.getData());
    }

    @PutMapping(path = "/admin/plans/{slug}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PlanInfo setImage(@PathVariable @Pattern(regexp = StudyPlanDto.SLUG_PATTERN) String slug,
            @RequestParam("file") MultipartFile file) throws IOException {
        return planService.setImage(slug, file.getBytes());
    }

    @DeleteMapping("/admin/plans/{slug}/image")
    public PlanInfo removeImage(@PathVariable @Pattern(regexp = StudyPlanDto.SLUG_PATTERN) String slug) {
        return planService.removeImage(slug);
    }
}
