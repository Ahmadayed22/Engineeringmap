package com.engineeringmap.server.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.engineeringmap.server.dto.request.CourseRequestDto;
import com.engineeringmap.server.dto.request.TrackingRequest;
import com.engineeringmap.server.dto.response.CourseResponseDto;
import com.engineeringmap.server.dto.response.ErrorResponse;
import com.engineeringmap.server.dto.response.SuccessResponse;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.security.UserDetailsImpl;
import com.engineeringmap.server.service.CourseService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<CourseResponseDto>> getAllCourses() {
        List<CourseResponseDto> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponseDto> getCourseById(@PathVariable Long id) {
        Optional<CourseResponseDto> course = courseService.getCourseById(id);
        return course.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@Valid @RequestBody CourseRequestDto course) {
        try {
            CourseResponseDto createdCourse = courseService.createCourse(course);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequestDto courseDetails) {
        try {
            CourseResponseDto updatedCourse = courseService.updateCourse(id, courseDetails);
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(new SuccessResponse("Course deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourseResponseDto>> searchCourses(@RequestParam @NotBlank String name) {
        List<CourseResponseDto> courses = courseService.searchCoursesByName(name);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/{courseId}/complete")
    public ResponseEntity<?> completeCourse(@PathVariable Long courseId, @RequestBody TrackingRequest trackingRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long userId = userDetails.getId();
            courseService.completeCourse(courseId, userId, trackingRequest.completed());
            return ResponseEntity.ok(new SuccessResponse("Course completion status updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/user/completed")
    public ResponseEntity<List<Long>> getCompletedCourses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        List<Long> completedCourses = courseService.getCompletedCourses(userId);
        return ResponseEntity.ok(completedCourses);
    }
}