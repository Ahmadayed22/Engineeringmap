package com.engineeringmap.server.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.engineeringmap.server.dto.CommunityDto;
import com.engineeringmap.server.dto.StudyMapDto.MapResponse;
import com.engineeringmap.server.dto.StudyMapDto.PublishRequest;
import com.engineeringmap.server.dto.StudyMapDto.VersionInfo;
import com.engineeringmap.server.security.UserDetailsImpl;
import com.engineeringmap.server.service.StudyMapService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;

/**
 * The study-plan maps. Reading is public; publishing, history and restore are under
 * /api/admin, which SecurityConfig limits to ADMIN.
 */
@RestController
@RequestMapping("/api")
@Validated
public class StudyMapController {

    private final StudyMapService mapService;

    public StudyMapController(StudyMapService mapService) {
        this.mapService = mapService;
    }

    @GetMapping("/maps/{plan}")
    public MapResponse current(@PathVariable @Pattern(regexp = CommunityDto.PLAN_PATTERN) String plan) {
        return mapService.current(plan);
    }

    @PutMapping("/admin/maps/{plan}")
    public MapResponse publish(@PathVariable @Pattern(regexp = CommunityDto.PLAN_PATTERN) String plan,
            @Valid @RequestBody PublishRequest request, @AuthenticationPrincipal UserDetailsImpl admin) {
        return mapService.publish(plan, request.baseVersion(), request.content(), admin.getId());
    }

    @GetMapping("/admin/maps/{plan}/versions")
    public List<VersionInfo> versions(@PathVariable @Pattern(regexp = CommunityDto.PLAN_PATTERN) String plan) {
        return mapService.versions(plan);
    }

    @PostMapping("/admin/maps/{plan}/versions/{version}/restore")
    public MapResponse restore(@PathVariable @Pattern(regexp = CommunityDto.PLAN_PATTERN) String plan,
            @PathVariable int version, @AuthenticationPrincipal UserDetailsImpl admin) {
        return mapService.restore(plan, version, admin.getId());
    }
}
