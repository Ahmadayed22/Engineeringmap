package com.engineeringmap.server.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.engineeringmap.server.entity.Comment;
@Repository
public interface CommentRepo extends JpaRepository<Comment,Long>{

    // Find comments by course ID ordered by creation date (newest first)
    List<Comment> findByCourseIdOrderByCreatedAtDesc(Long courseId);
    
    // Find comments by course ID with pagination
     Page<Comment> findByCourseIdOrderByCreatedAtDesc(Long courseId, Pageable pageable);
    
    // Find comments by user ID
    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Count comments for a course
    long countByCourseId(Long courseId);
    
    // Find comments by course ID with user information
    @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.course.id = :courseId ORDER BY c.createdAt DESC")
    List<Comment> findByCourseIdWithUser(@Param("courseId") Long courseId);
    
    // Find comments by course ID with pagination and user info
    // @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.course.id = :courseId ORDER BY c.createdAt DESC")
    // Page<Comment> findByCourseIdWithUser(@Param("courseId") Long courseId, Pageable pageable);
    
    // Find recent comments across all courses
    @Query("SELECT c FROM Comment c JOIN FETCH c.user JOIN FETCH c.course ORDER BY c.createdAt DESC")
    List<Comment> findRecentCommentsWithDetails(Pageable pageable);
    
    // Delete all comments for a course
    void deleteByCourseId(Long courseId);
    
    // Find comments by user ID and course ID
    List<Comment> findByUserIdAndCourseIdOrderByCreatedAtDesc(Long userId, Long courseId);
     @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.course.id = :courseId ORDER BY c.createdAt ASC")
    List<Comment> findByCourseIdWithUserOrderByCreatedAtAsc(Long courseId);
} 
