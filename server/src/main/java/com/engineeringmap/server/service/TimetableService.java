package com.engineeringmap.server.service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.StudyToolsDto.TimetableItem;
import com.engineeringmap.server.entity.TimetableEntry;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.TimetableEntryRepo;
import com.engineeringmap.server.repo.UserRepo;

/**
 * Each student's weekly timetable. Clashes are allowed (the client warns about them), so a
 * student can keep two options side by side while choosing sections.
 */
@Service
@Transactional
public class TimetableService {

    static final String END_BEFORE_START = "A class must end after it starts";
    static final String UNKNOWN_COURSE = "Unknown course in timetable";

    private final TimetableEntryRepo repo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;

    public TimetableService(TimetableEntryRepo repo, CourseRepo courseRepo, UserRepo userRepo) {
        this.repo = repo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public List<TimetableItem> get(Long userId) {
        return repo.findByUserIdOrderByDayOfWeekAscStartMinuteAsc(userId).stream()
                .map(e -> new TimetableItem(e.getCourse() == null ? null : e.getCourse().getId(), e.getTitle(),
                        e.getDayOfWeek(), e.getStartMinute(), e.getEndMinute(), e.getLocation(), e.getColor()))
                .toList();
    }

    /** Replaces the whole timetable; the client always sends the full list. */
    public List<TimetableItem> replace(Long userId, List<TimetableItem> items) {
        Set<Long> courseIds = new HashSet<>();
        for (TimetableItem item : items) {
            if (item.end() <= item.start()) {
                throw new IllegalArgumentException(END_BEFORE_START);
            }
            if (item.courseId() != null) {
                courseIds.add(item.courseId());
            }
        }
        if (!courseIds.isEmpty() && courseRepo.findAllById(courseIds).size() != courseIds.size()) {
            throw new IllegalArgumentException(UNKNOWN_COURSE);
        }

        repo.deleteByUser(userId);
        repo.flush();
        var user = userRepo.getReferenceById(userId);
        for (TimetableItem item : items) {
            TimetableEntry e = new TimetableEntry();
            e.setUser(user);
            e.setCourse(item.courseId() == null ? null : courseRepo.getReferenceById(item.courseId()));
            e.setTitle(item.title().strip());
            e.setDayOfWeek(item.day());
            e.setStartMinute(item.start());
            e.setEndMinute(item.end());
            String location = item.location() == null ? null : item.location().strip();
            e.setLocation(Objects.equals(location, "") ? null : location);
            e.setColor(item.color());
            repo.save(e);
        }
        return get(userId);
    }
}
