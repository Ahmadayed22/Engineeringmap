package com.engineeringmap.server.controller;

import java.util.List;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.engineeringmap.server.dto.CommunityDto;
import com.engineeringmap.server.dto.request.ResourceRequestDto;
import com.engineeringmap.server.dto.response.SuccessResponse;
import com.engineeringmap.server.dto.response.ResouceResponseDto;
import com.engineeringmap.server.security.UserDetailsImpl;
import com.engineeringmap.server.service.ResourceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resource")

public class ResourceController {
    
    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResouceResponseDto> getResourceById(@PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        ResouceResponseDto res = resourceService.getResourceById(id,
                userDetails == null ? null : userDetails.getId(), StudyPlanController.isAdmin(userDetails));
        return ResponseEntity.ok(res);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ResouceResponseDto>> getResourcesByCourseId(@PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long viewerId = userDetails == null ? null : userDetails.getId();
        List<ResouceResponseDto> resources = resourceService.getResourceByCourseId(courseId, viewerId);
        return ResponseEntity.ok(resources);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<CommunityDto.VoteResponse> vote(@PathVariable Long id,
            @Valid @RequestBody CommunityDto.VoteRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(resourceService.vote(id, userDetails.getId(), request.value()));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<SuccessResponse> report(@PathVariable Long id,
            @Valid @RequestBody CommunityDto.ReportRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        resourceService.report(id, userDetails.getId(), request);
        return ResponseEntity.ok(new SuccessResponse("Thanks. An admin will review this material."));
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<ResouceResponseDto> createResourceByCourseId(@PathVariable Long courseId,
             @Valid @RequestBody ResourceRequestDto resource
            , @AuthenticationPrincipal UserDetailsImpl userDetails) {
            Long userId = userDetails.getId();
        ResouceResponseDto res = resourceService.createResourceByCourseId(resource,courseId,userId);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResouceResponseDto> UpdateResourceByCourseId(@PathVariable Long id ,@Valid @RequestBody ResourceRequestDto resource,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
                Long userId = userDetails.getId();
        ResouceResponseDto res = resourceService.updateResourceByCourseId(resource, id,userId);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> DeleteResourceByCourseId(@PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
            Long userId = userDetails.getId();
            resourceService.deleteResourceById(id,userId);
         return ResponseEntity.noContent().build();
    }


}
