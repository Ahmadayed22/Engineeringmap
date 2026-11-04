package com.engineeringmap.server.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.CourseRating;

public interface CourseRatingRepo extends JpaRepository<CourseRating, Long> {

    Optional<CourseRating> findByCourseIdAndUserId(Long courseId, Long userId);

    /** [count, avgDifficulty, avgWorkload] (one row). */
    @Query("SELECT COUNT(r), AVG(r.difficulty), AVG(r.workload) FROM CourseRating r WHERE r.course.id = :courseId")
    List<Object[]> summaryFor(@Param("courseId") Long courseId);
}
