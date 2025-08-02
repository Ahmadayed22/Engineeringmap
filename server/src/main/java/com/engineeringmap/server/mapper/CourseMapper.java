package com.engineeringmap.server.mapper;

import com.engineeringmap.server.dto.request.CourseRequestDto;
import com.engineeringmap.server.dto.response.CourseResponseDto;
import com.engineeringmap.server.entity.Course;


public class CourseMapper {
    public static Course toEntity(CourseRequestDto dto) {
        Course course = new Course();
        course.setName(dto.name());
        course.setLabel(dto.label());
        course.setDescription(dto.description());
        course.setCreditHours(dto.creditHours());
        return course;
    }

    public static CourseResponseDto toResponseDto(Course course) {
        return new CourseResponseDto(
            course.getId(),
            course.getName(),
            course.getLabel(),
            course.getDescription(),
            course.getCreditHours(),
            course.getCreatedAt(),
            course.getUpdatedAt()
        );
    }
}