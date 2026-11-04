package com.engineeringmap.server.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.StudyToolsDto.ExamDateRequest;
import com.engineeringmap.server.dto.StudyToolsDto.ExamDateResponse;
import com.engineeringmap.server.entity.ExamDate;
import com.engineeringmap.server.entity.Notification;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.ExamDateRepo;
import com.engineeringmap.server.repo.UserRepo;

/** A student's own exam dates (the countdown page) and the reminders sent before them. */
@Service
@Transactional
public class ExamDateService {

    static final int MAX_PER_USER = 60;
    static final Duration SOON = Duration.ofDays(3);
    static final Duration TOMORROW = Duration.ofDays(1);

    static final String NOT_FOUND = "Exam not found";
    static final String TOO_MANY = "You can keep up to 60 exams. Delete old ones first.";

    private final ExamDateRepo repo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;
    private final NotificationService notifications;

    public ExamDateService(ExamDateRepo repo, CourseRepo courseRepo, UserRepo userRepo,
            NotificationService notifications) {
        this.repo = repo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<ExamDateResponse> list(Long userId) {
        return repo.findByUserIdOrderByStartsAtAsc(userId).stream().map(ExamDateService::toResponse).toList();
    }

    public ExamDateResponse create(Long userId, ExamDateRequest request) {
        if (repo.countByUserId(userId) >= MAX_PER_USER) {
            throw new IllegalArgumentException(TOO_MANY);
        }
        ExamDate exam = new ExamDate();
        exam.setUser(userRepo.getReferenceById(userId));
        apply(exam, request);
        return toResponse(repo.save(exam));
    }

    public ExamDateResponse update(Long id, Long userId, ExamDateRequest request) {
        ExamDate exam = own(id, userId);
        Instant before = exam.getStartsAt();
        apply(exam, request);
        if (!exam.getStartsAt().equals(before)) {
            exam.setRemindersSent(0); // a moved exam gets its reminders again
        }
        return toResponse(exam);
    }

    public void delete(Long id, Long userId) {
        repo.delete(own(id, userId));
    }

    /** Checks every 15 minutes (first run a minute after start-up). */
    @Scheduled(fixedDelay = 15 * 60 * 1000, initialDelay = 60 * 1000)
    public void sendReminders() {
        sendDueReminders(Instant.now());
    }

    /**
     * Sends "3 days left" and "tomorrow" notifications that are due at {@code now}. An exam added
     * less than a day before it starts only gets the "tomorrow" one. Returns how many were sent.
     */
    public int sendDueReminders(Instant now) {
        int sent = 0;
        for (ExamDate exam : repo.dueForReminder(now, now.plus(SOON))) {
            Long courseId = exam.getCourse() == null ? null : exam.getCourse().getId();
            boolean withinDay = !exam.getStartsAt().isAfter(now.plus(TOMORROW));
            if (withinDay) {
                notifications.notify(exam.getUser(), Notification.EXAM_TOMORROW, exam.getTitle(), courseId);
                exam.setRemindersSent(2);
                sent++;
            } else if (exam.getRemindersSent() == 0) {
                notifications.notify(exam.getUser(), Notification.EXAM_SOON, exam.getTitle(), courseId);
                exam.setRemindersSent(1);
                sent++;
            }
        }
        return sent;
    }

    private void apply(ExamDate exam, ExamDateRequest r) {
        exam.setCourse(r.courseId() == null ? null
                : courseRepo.findById(r.courseId())
                        .orElseThrow(() -> new IllegalArgumentException("Course not found")));
        exam.setTitle(r.title().strip());
        exam.setKind(r.kind());
        exam.setStartsAt(r.startsAt());
        String location = r.location() == null ? "" : r.location().strip();
        exam.setLocation(location.isEmpty() ? null : location);
    }

    private ExamDate own(Long id, Long userId) {
        ExamDate exam = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND));
        if (!exam.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException(NOT_FOUND); // someone else's: don't reveal it exists
        }
        return exam;
    }

    private static ExamDateResponse toResponse(ExamDate e) {
        return new ExamDateResponse(e.getId(), e.getCourse() == null ? null : e.getCourse().getId(), e.getTitle(),
                e.getKind(), e.getStartsAt(), e.getLocation());
    }
}
