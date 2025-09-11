package com.engineeringmap.server.repo;

import com.engineeringmap.server.entity.Course;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepo  extends JpaRepository<Course,Long>{

    
 // Find courses by name containing (case insensitive)
    List<Course> findByNameContainingIgnoreCase(String name);
    
    // Custom query to get courses with comment count
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.comments WHERE c.id = :courseId")
    Optional<Course> findByIdWithComments(@Param("courseId") Long courseId);
    
    // Get all courses ordered by creation date
    // List<Course> findAllByOrderByCreatedAtDesc();

    Optional<Course> findByNameIgnoreCase(String name);
}
