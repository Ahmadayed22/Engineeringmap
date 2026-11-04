package com.engineeringmap.server.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.engineeringmap.server.entity.StudyPlan;

public interface StudyPlanRepo extends JpaRepository<StudyPlan, Long> {

    Optional<StudyPlan> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<StudyPlan> findAllByOrderBySortOrderAscIdAsc();

    List<StudyPlan> findByVisibleTrueOrderBySortOrderAscIdAsc();

    @Query("select coalesce(max(p.sortOrder), 0) from StudyPlan p")
    int maxSortOrder();
}
