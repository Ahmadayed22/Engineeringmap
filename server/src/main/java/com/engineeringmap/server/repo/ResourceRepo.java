package com.engineeringmap.server.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.Resource;

public interface ResourceRepo extends JpaRepository<Resource,Long>{
    List<Resource> findByCourseId(Long courseId);

    /** Approved materials, plus the viewer's own ones still waiting for review (viewerId may be null). */
    @Query("select r from Resource r where r.course.id = :courseId and (r.approved = true or r.user.id = :viewerId)")
    List<Resource> visibleForCourse(@Param("courseId") Long courseId, @Param("viewerId") Long viewerId);

    @Query("select r from Resource r join fetch r.user join fetch r.course where r.approved = false order by r.id")
    List<Resource> pending();
}
