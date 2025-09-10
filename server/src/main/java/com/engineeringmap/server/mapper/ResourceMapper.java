package com.engineeringmap.server.mapper;

import com.engineeringmap.server.dto.request.ResourceRequestDto;
import com.engineeringmap.server.dto.response.ResouceResponseDto;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.Resource;
import com.engineeringmap.server.entity.User;

public class ResourceMapper {
    public static Resource toEntity(ResourceRequestDto dto, Course course,User userId) {
        Resource resource = new Resource();
        resource.setBooks(dto.books());
        resource.setSummaries(dto.summaries());
        resource.setSlides(dto.slides());
        resource.setLabs(dto.labs());
        resource.setExams(dto.exams());
        resource.setVideos(dto.videos());
        resource.setCourse(course);
        resource.setUser(userId);
        resource.setName(dto.name());
        return resource;

    }

    public static ResouceResponseDto toDto(Resource resource) {
        return new ResouceResponseDto(
            resource.getId(),
            resource.getBooks(),
            resource.getSummaries(),
            resource.getSlides(),
            resource.getLabs(),
            resource.getExams(),
            resource.getVideos(),
            resource.getCourse().getId(),
            resource.getUser().getId(),
            resource.getName()
            
        );
    }

    public static void updateEntity(Resource resource, ResourceRequestDto dto) {
        resource.setBooks(dto.books());
        resource.setSummaries(dto.summaries());
        resource.setSlides(dto.slides());
        resource.setLabs(dto.labs());
        resource.setExams(dto.exams());
        resource.setVideos(dto.videos());
      
    }
}
