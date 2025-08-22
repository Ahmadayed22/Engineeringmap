package com.engineeringmap.server.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.request.ResourceRequestDto;
import com.engineeringmap.server.dto.response.ResouceResponseDto;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.Resource;
import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.mapper.ResourceMapper;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.ResourceRepo;
import com.engineeringmap.server.repo.UserRepo;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepo resourceRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;

    public ResourceService(ResourceRepo resourceRepo, CourseRepo courseRepo, UserRepo userRepo) {
            this.resourceRepo = resourceRepo;
            this.courseRepo = courseRepo;
            this.userRepo = userRepo;
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
            throw new RuntimeException("You can only edit your own resource");
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
            throw new RuntimeException("You can only delete your own resource unless you are an admin");
        }
   
        resourceRepo.delete(resource);
    }
}
