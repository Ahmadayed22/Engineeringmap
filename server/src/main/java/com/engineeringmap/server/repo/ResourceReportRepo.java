package com.engineeringmap.server.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.engineeringmap.server.entity.ResourceReport;

public interface ResourceReportRepo extends JpaRepository<ResourceReport, Long> {

    @Query("SELECT r FROM ResourceReport r JOIN FETCH r.resource res JOIN FETCH res.course "
            + "JOIN FETCH r.reporter WHERE r.resolved = false ORDER BY r.createdAt DESC")
    List<ResourceReport> findOpenWithDetails();

    boolean existsByResourceIdAndReporterIdAndResolvedFalse(Long resourceId, Long reporterId);

    long countByResolvedFalse();
}
