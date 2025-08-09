package com.engineeringmap.server.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.request.ResourceRequestDto;
import com.engineeringmap.server.dto.response.ResouceResponseDto;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.Resource;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.mapper.ResourceMapper;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.ResourceRepo;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepo resourceRepo;
    private final CourseRepo courseRepo;

    public ResourceService(ResourceRepo resourceRepo, CourseRepo courseRepo) {
        this.resourceRepo = resourceRepo;
        this.courseRepo = courseRepo;
    }

    public ResouceResponseDto getResourceById(Long id) {
        Resource resource = resourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return ResourceMapper.toDto(resource);
    }

    public List<ResouceResponseDto> getResourceByCourseId(Long courseId) {
        List<Resource> resources = resourceRepo.findByCourseId(courseId);
        return resources.stream()
            .map(ResourceMapper::toDto)
            .toList();
    }

    public ResouceResponseDto createResourceByCourseId(ResourceRequestDto dto, Long courseId) {
        Course course = courseRepo.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        Resource resource = ResourceMapper.toEntity(dto, course);
        Resource saved = resourceRepo.save(resource);
        return ResourceMapper.toDto(saved);
    }

    public ResouceResponseDto updateResourceByCourseId(ResourceRequestDto dto, Long id) {
        Resource resource = resourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        ResourceMapper.updateEntity(resource, dto);
        Resource updated = resourceRepo.save(resource);
        return ResourceMapper.toDto(updated);
    }

    public void deleteResourceById(Long id) {
        Resource resource = resourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resourceRepo.delete(resource);
    }
}
