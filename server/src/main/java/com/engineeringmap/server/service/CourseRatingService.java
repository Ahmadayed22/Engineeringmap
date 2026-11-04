package com.engineeringmap.server.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.CommunityDto.RatingRequest;
import com.engineeringmap.server.dto.CommunityDto.RatingSummary;
import com.engineeringmap.server.entity.CourseRating;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.CourseRatingRepo;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.UserRepo;

@Service
@Transactional
public class CourseRatingService {

    private final CourseRatingRepo ratingRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;

    public CourseRatingService(CourseRatingRepo ratingRepo, CourseRepo courseRepo, UserRepo userRepo) {
        this.ratingRepo = ratingRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public RatingSummary summary(Long courseId, Long viewerId) {
        List<Object[]> rows = ratingRepo.summaryFor(courseId);
        Object[] row = rows.isEmpty() ? new Object[] {0L, null, null} : rows.get(0);
        long count = ((Number) row[0]).longValue();
        Double difficulty = row[1] == null ? null : round1(((Number) row[1]).doubleValue());
        Double workload = row[2] == null ? null : round1(((Number) row[2]).doubleValue());

        Integer myDifficulty = null;
        Integer myWorkload = null;
        if (viewerId != null) {
            var mine = ratingRepo.findByCourseIdAndUserId(courseId, viewerId);
            if (mine.isPresent()) {
                myDifficulty = mine.get().getDifficulty();
                myWorkload = mine.get().getWorkload();
            }
        }
        return new RatingSummary(courseId, count, difficulty, workload, myDifficulty, myWorkload);
    }

    public RatingSummary rate(Long courseId, Long userId, RatingRequest request) {
        var course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        CourseRating rating = ratingRepo.findByCourseIdAndUserId(courseId, userId).orElseGet(() -> {
            CourseRating r = new CourseRating();
            r.setCourse(course);
            r.setUser(userRepo.getReferenceById(userId));
            return r;
        });
        rating.setDifficulty(request.difficulty());
        rating.setWorkload(request.workload());
        ratingRepo.saveAndFlush(rating);
        return summary(courseId, userId);
    }

    private static double round1(double v) {
        return Math.round(v * 10) / 10.0;
    }
}
