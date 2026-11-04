package com.engineeringmap.server.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.PlannedCourse;

public interface PlannedCourseRepo extends JpaRepository<PlannedCourse, Long> {

    List<PlannedCourse> findByUserIdAndPlanOrderBySemesterAsc(Long userId, String plan);

    @Modifying
    @Query("DELETE FROM PlannedCourse p WHERE p.user.id = :userId AND p.plan = :plan")
    int deleteByUserAndPlan(@Param("userId") Long userId, @Param("plan") String plan);
}
