package com.engineeringmap.server.service;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.engineeringmap.server.dto.request.CourseRequestDto;
import com.engineeringmap.server.dto.request.MarkRequest;
import com.engineeringmap.server.dto.response.CourseResponseDto;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.Tracking;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.mapper.CourseMapper;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.TrackingRepo;
import com.engineeringmap.server.repo.UserRepo;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {
    
    private final CourseRepo courseRepository;
    private final UserRepo userRepository;
    private final TrackingRepo trackingRepo;
    
    public CourseService(CourseRepo courseRepository  , UserRepo userRepository, TrackingRepo trackingRepo) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.trackingRepo = trackingRepo;
    }

    public List<CourseResponseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
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

public void completeCourse(Long courseId, Long userId, boolean completed) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        Optional<Tracking> existingCompletion = trackingRepo.findByUserIdAndCourseId(userId, courseId);
        if (existingCompletion.isPresent()) {
            Tracking completion = existingCompletion.get();
            completion.setCompleted(completed);
 
            trackingRepo.save(completion);
        } else if (completed) {
            Tracking completion = new Tracking();
            completion.setUser(user);
            completion.setCourse(course);
            completion.setCompleted(true);
         
            trackingRepo.save(completion);
        }
    }

    public List<Long> getCompletedCourses(Long userId) {
        return trackingRepo.findByUserIdAndCompleted(userId, true)
            .stream()
            .map(completion -> completion.getCourse().getId())
            .collect(Collectors.toList());
    }

    public void createMark(Long courseId, Long userId, String markRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Use Not Found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course Not Found"));
        Optional<Tracking> existingMark = trackingRepo.findByUserIdAndCourseId(userId, courseId);
        if (existingMark.isPresent()) {
            Tracking mark = existingMark.get();
            mark.setMark(markRequest);
            trackingRepo.save(mark);
        } else {
            Tracking mark = new Tracking();
            mark.setUser(user);
            mark.setCourse(course);
            mark.setMark(markRequest);
            trackingRepo.save(mark);
        }

    }

  
    public List<String> getMarkCourses(Long userId) {
        
        return trackingRepo.findByUserId(userId).stream()
                .map(mark -> mark.getMark())
                .filter(mark -> mark != null)
                .collect(Collectors.toList());
        
    }

    public String getMarkCourseById(Long userId, Long courseId) {
        Tracking tracking = trackingRepo.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException(
                        "Mark not found for userId: " + userId + " and courseId: " + courseId));
        return tracking.getMark();
    }

    public Map<Long, String> getAllUserMarks(Long userId) {
        List<Tracking> trackings = trackingRepo.findByUserIdAndMarkIsNotNull(userId);
        return trackings.stream()
            .collect(Collectors.toMap(
                tracking -> tracking.getCourse().getId(),
                Tracking::getMark
            ));
    }

}