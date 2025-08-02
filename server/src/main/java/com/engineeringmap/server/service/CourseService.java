package com.engineeringmap.server.service;

import org.springframework.stereotype.Service;

import com.engineeringmap.server.dto.request.CourseRequestDto;
import com.engineeringmap.server.dto.response.CourseResponseDto;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.mapper.CourseMapper;
import com.engineeringmap.server.repo.CourseRepo;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {
    
    private final CourseRepo courseRepository;
    
    public CourseService(CourseRepo courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<CourseResponseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAllByOrderByCreatedAtDesc();
        return courses.stream()
                     .map(CourseMapper::toResponseDto)
                     .toList();
    }
    
    public Optional<CourseResponseDto> getCourseById(Long id) {
        return courseRepository.findById(id)
                              .map(CourseMapper::toResponseDto);
    }
    
    public CourseResponseDto createCourse(CourseRequestDto courseDto) {
        if (courseRepository.findByNameIgnoreCase(courseDto.name()).isPresent()) {
            throw new RuntimeException("Course name already exists: " + courseDto.name());
        }
        Course course = CourseMapper.toEntity(courseDto);
        Course savedCourse = courseRepository.save(course);
        return CourseMapper.toResponseDto(savedCourse);
    }
    
    public CourseResponseDto updateCourse(Long id, CourseRequestDto courseDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        
        if (!course.getName().equalsIgnoreCase(courseDetails.name()) && 
            courseRepository.findByNameIgnoreCase(courseDetails.name()).isPresent()) {
            throw new RuntimeException("Course name already exists: " + courseDetails.name());
        }
        
        course.setName(courseDetails.name());
        course.setLabel(courseDetails.label());
        course.setDescription(courseDetails.description());
        course.setCreditHours(courseDetails.creditHours());
        
        Course updatedCourse = courseRepository.save(course);
        return CourseMapper.toResponseDto(updatedCourse);
    }
    
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        courseRepository.delete(course);
    }
    
    public List<CourseResponseDto> searchCoursesByName(String name) {
        List<Course> courses = courseRepository.findByNameContainingIgnoreCase(name);
        return courses.stream()
                     .map(CourseMapper::toResponseDto)
                     .toList();
    }
}