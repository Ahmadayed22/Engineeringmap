package com.engineeringmap.server.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.engineeringmap.server.dto.request.ResourceRequestDto;
import com.engineeringmap.server.dto.response.ResouceResponseDto;
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
    public ResponseEntity<ResouceResponseDto> getResourceById(@PathVariable Long id) {
        ResouceResponseDto res = resourceService.getResourceById(id);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ResouceResponseDto>> getResourcesByCourseId(@PathVariable Long courseId) {
        List<ResouceResponseDto> resources = resourceService.getResourceByCourseId(courseId);
        return ResponseEntity.ok(resources);
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<ResouceResponseDto> createResourceByCourseId(@PathVariable Long courseId,@Valid @RequestBody ResourceRequestDto resource) {
        ResouceResponseDto res = resourceService.createResourceByCourseId(resource,courseId);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResouceResponseDto> UpdateResourceByCourseId(@PathVariable Long id ,@Valid @RequestBody ResourceRequestDto resource) {
        ResouceResponseDto res = resourceService.updateResourceByCourseId(resource, id);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
        public ResponseEntity<Void> DeleteResourceByCourseId(@PathVariable Long id) {
        resourceService.deleteResourceById(id);
         return ResponseEntity.noContent().build();
    }


}
