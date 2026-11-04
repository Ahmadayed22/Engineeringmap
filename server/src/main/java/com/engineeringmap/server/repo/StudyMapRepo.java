package com.engineeringmap.server.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.engineeringmap.server.entity.StudyMap;

public interface StudyMapRepo extends JpaRepository<StudyMap, Long> {

    Optional<StudyMap> findTopByPlanOrderByVersionDesc(String plan);

    Optional<StudyMap> findByPlanAndVersion(String plan, int version);

    /** Newest first, without loading the (large) content column. */
    @Query("""
            select new com.engineeringmap.server.dto.StudyMapDto$VersionInfo(m.version, m.createdAt, u.username)
            from StudyMap m left join m.createdBy u
            where m.plan = :plan
            order by m.version desc
            """)
    List<com.engineeringmap.server.dto.StudyMapDto.VersionInfo> versions(String plan);
}
