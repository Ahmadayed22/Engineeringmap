package com.engineeringmap.server.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.CommunityDto.PlanItem;
import com.engineeringmap.server.entity.PlannedCourse;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.PlannedCourseRepo;
import com.engineeringmap.server.repo.UserRepo;

/** Stores each student's semester plan. Prerequisite checks happen in the client. */
@Service
@Transactional
public class PlannerService {

    private final PlannedCourseRepo planRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;

    public PlannerService(PlannedCourseRepo planRepo, CourseRepo courseRepo, UserRepo userRepo) {
        this.planRepo = planRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public List<PlanItem> get(Long userId, String plan) {
        return planRepo.findByUserIdAndPlanOrderBySemesterAsc(userId, plan).stream()
                .map(p -> new PlanItem(p.getCourse().getId(), p.getSemester()))
                .toList();
    }

    /** Replaces the whole plan, which keeps the client simple (it always sends the full list). */
    public List<PlanItem> replace(Long userId, String plan, List<PlanItem> items) {
        Set<Long> seen = new HashSet<>();
        for (PlanItem item : items) {
            if (!seen.add(item.courseId())) {
                throw new IllegalArgumentException("A course can only be planned once");
            }
        }
        if (!items.isEmpty() && courseRepo.findAllById(seen).size() != seen.size()) {
            throw new IllegalArgumentException("Unknown course in plan");
        }

        planRepo.deleteByUserAndPlan(userId, plan);
        planRepo.flush();
        var user = userRepo.getReferenceById(userId);
        for (PlanItem item : items) {
            PlannedCourse p = new PlannedCourse();
            p.setUser(user);
            p.setCourse(courseRepo.getReferenceById(item.courseId()));
            p.setPlan(plan);
            p.setSemester(item.semester());
            planRepo.save(p);
        }
        return get(userId, plan);
    }
}
