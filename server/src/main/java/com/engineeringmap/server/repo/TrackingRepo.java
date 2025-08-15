package com.engineeringmap.server.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.engineeringmap.server.entity.Tracking;

@Repository
public interface TrackingRepo extends JpaRepository<Tracking, Long> {
    // Additional query methods can be defined here if needed
    Optional<Tracking> findByUserIdAndCourseId(Long userId, Long courseId);

    List<Tracking> findByUserIdAndCompleted(Long userId, boolean completed);

    List<Tracking> findByUserId(Long userId);
    List<Tracking> findByUserIdAndMarkIsNotNull(Long userId);
     
} 