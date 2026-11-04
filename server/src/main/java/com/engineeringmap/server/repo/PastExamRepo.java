package com.engineeringmap.server.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.PastExam;

public interface PastExamRepo extends JpaRepository<PastExam, Long> {
    /** Approved exams, plus the viewer's own ones still waiting for review (viewerId may be null). */
    @Query("""
            select e from PastExam e join fetch e.uploader
            where e.course.id = :courseId and (e.approved = true or e.uploader.id = :viewerId)
            order by e.year desc, e.term desc, e.id desc""")
    List<PastExam> visibleForCourse(@Param("courseId") Long courseId, @Param("viewerId") Long viewerId);

    @Query("select e from PastExam e join fetch e.uploader join fetch e.course where e.approved = false order by e.id")
    List<PastExam> pending();

    long countByUploaderIdAndApprovedFalse(Long uploaderId);
}
