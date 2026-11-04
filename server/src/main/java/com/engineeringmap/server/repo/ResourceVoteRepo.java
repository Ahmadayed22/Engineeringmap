package com.engineeringmap.server.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.engineeringmap.server.entity.ResourceVote;

public interface ResourceVoteRepo extends JpaRepository<ResourceVote, Long> {

    Optional<ResourceVote> findByResourceIdAndUserId(Long resourceId, Long userId);

    /** [resourceId, score] for every voted material of a course. */
    @Query("SELECT v.resource.id, SUM(v.value) FROM ResourceVote v "
            + "WHERE v.resource.course.id = :courseId GROUP BY v.resource.id")
    List<Object[]> scoresForCourse(@Param("courseId") Long courseId);

    @Query("SELECT COALESCE(SUM(v.value), 0) FROM ResourceVote v WHERE v.resource.id = :resourceId")
    long scoreFor(@Param("resourceId") Long resourceId);

    @Query("SELECT v FROM ResourceVote v WHERE v.resource.course.id = :courseId AND v.user.id = :userId")
    List<ResourceVote> userVotesForCourse(@Param("courseId") Long courseId, @Param("userId") Long userId);
}
