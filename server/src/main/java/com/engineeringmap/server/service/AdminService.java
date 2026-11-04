package com.engineeringmap.server.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.CommunityDto.ReportResponse;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.ResourceReportRepo;

/** Moderation queue for reported materials (admin only, enforced in SecurityConfig). */
@Service
@Transactional
public class AdminService {

    private final ResourceReportRepo reportRepo;

    public AdminService(ResourceReportRepo reportRepo) {
        this.reportRepo = reportRepo;
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> openReports() {
        return reportRepo.findOpenWithDetails().stream()
                .map(r -> new ReportResponse(r.getId(), r.getResource().getId(), r.getResource().getName(),
                        r.getResource().getCourse().getId(), r.getResource().getCourse().getLabel(),
                        r.getReason(), r.getReporter().getUsername(), r.getCreatedAt()))
                .toList();
    }

    public void resolve(Long reportId) {
        var report = reportRepo.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setResolved(true);
    }
}
