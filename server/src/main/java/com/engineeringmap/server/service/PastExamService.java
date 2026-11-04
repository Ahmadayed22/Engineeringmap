package com.engineeringmap.server.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.StudyToolsDto.PastExamResponse;
import com.engineeringmap.server.dto.StudyToolsDto.PastExamUpload;
import com.engineeringmap.server.dto.StudyToolsDto.PendingExam;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.Notification;
import com.engineeringmap.server.entity.PastExam;
import com.engineeringmap.server.entity.PastExamFile;
import com.engineeringmap.server.exception.ResourceNotFoundException;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.PastExamFileRepo;
import com.engineeringmap.server.repo.PastExamRepo;
import com.engineeringmap.server.repo.UserRepo;

/**
 * Old exam papers per course, stored in the database (the server's disk is wiped on deploy).
 * Admin uploads are public at once; a student's upload waits for an admin to approve it.
 */
@Service
@Transactional
public class PastExamService {

    public static final int MAX_FILE_BYTES = 10 * 1024 * 1024;
    /** A student can have this many uploads waiting for review at once. */
    static final int MAX_PENDING_PER_USER = 20;

    public static final String BAD_FILE = "Upload a PDF, JPG, PNG or WebP file";
    public static final String FILE_TOO_LARGE = "The file is too large (10 MB at most)";
    static final String TOO_MANY_PENDING = "You have too many uploads waiting for review. Try again after an admin reviews them.";
    static final String NOT_FOUND = "Exam not found";
    static final String NOT_YOURS = "You can only delete your own uploads";

    private final PastExamRepo examRepo;
    private final PastExamFileRepo fileRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;
    private final NotificationService notifications;

    public PastExamService(PastExamRepo examRepo, PastExamFileRepo fileRepo, CourseRepo courseRepo,
            UserRepo userRepo, NotificationService notifications) {
        this.examRepo = examRepo;
        this.fileRepo = fileRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<PastExamResponse> list(Long courseId, Long viewerId) {
        return examRepo.visibleForCourse(courseId, viewerId).stream().map(e -> toResponse(e, viewerId)).toList();
    }

    public PastExamResponse upload(Long courseId, Long userId, boolean isAdmin, PastExamUpload meta,
            String originalName, byte[] data) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException(BAD_FILE);
        }
        if (data.length > MAX_FILE_BYTES) {
            throw new IllegalArgumentException(FILE_TOO_LARGE);
        }
        String type = fileType(data);
        if (type == null) {
            throw new IllegalArgumentException(BAD_FILE);
        }
        if (!isAdmin && examRepo.countByUploaderIdAndApprovedFalse(userId) >= MAX_PENDING_PER_USER) {
            throw new IllegalArgumentException(TOO_MANY_PENDING);
        }

        PastExam exam = new PastExam();
        exam.setCourse(course);
        exam.setUploader(userRepo.getReferenceById(userId));
        exam.setKind(meta.kind());
        exam.setYear(meta.year());
        exam.setTerm(meta.term());
        String doctor = meta.doctor() == null ? "" : meta.doctor().strip();
        exam.setDoctor(doctor.isEmpty() ? null : doctor);
        exam.setWithSolution(Boolean.TRUE.equals(meta.withSolution()));
        exam.setFileName(cleanFileName(originalName, type));
        exam.setContentType(type);
        exam.setSizeBytes(data.length);
        exam.setApproved(isAdmin);
        PastExam saved = examRepo.saveAndFlush(exam);
        fileRepo.save(new PastExamFile(saved.getId(), data));
        return toResponse(examRepo.findById(saved.getId()).orElseThrow(), userId);
    }

    /** The exam and its file. Unapproved ones are only for their uploader and admins. */
    @Transactional(readOnly = true)
    public ExamFile file(Long examId, Long viewerId, boolean isAdmin) {
        PastExam exam = examRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND));
        if (!exam.isApproved() && !isAdmin && !exam.getUploader().getId().equals(viewerId)) {
            throw new ResourceNotFoundException(NOT_FOUND);
        }
        PastExamFile file = fileRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND));
        return new ExamFile(exam.getFileName(), exam.getContentType(), exam.isApproved(), file.getData());
    }

    public record ExamFile(String fileName, String contentType, boolean approved, byte[] data) {
    }

    public void delete(Long examId, Long userId, boolean isAdmin) {
        PastExam exam = examRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND));
        if (!isAdmin && !exam.getUploader().getId().equals(userId)) {
            throw new AccessDeniedException(NOT_YOURS);
        }
        examRepo.delete(exam);
    }

    // ----- Admin review -----
    @Transactional(readOnly = true)
    public List<PendingExam> pending() {
        return examRepo.pending().stream()
                .map(e -> new PendingExam(e.getId(), e.getCourse().getId(), e.getCourse().getLabel(), e.getKind(),
                        e.getYear(), e.getTerm(), e.getDoctor(), e.isWithSolution(), e.getFileName(),
                        e.getContentType(), e.getSizeBytes(), e.getUploader().getUsername(), e.getCreatedAt()))
                .toList();
    }

    public void approve(Long examId) {
        PastExam exam = examRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND));
        if (exam.isApproved()) {
            return;
        }
        exam.setApproved(true);
        notifications.notify(exam.getUploader(), Notification.EXAM_APPROVED, exam.getCourse().getLabel(),
                exam.getCourse().getId());
    }

    /** Deletes a waiting upload and tells the student. */
    public void reject(Long examId) {
        PastExam exam = examRepo.findById(examId).orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND));
        notifications.notify(exam.getUploader(), Notification.EXAM_REJECTED, exam.getCourse().getLabel(),
                exam.getCourse().getId());
        examRepo.delete(exam);
    }

    private static PastExamResponse toResponse(PastExam e, Long viewerId) {
        boolean mine = viewerId != null && e.getUploader().getId().equals(viewerId);
        return new PastExamResponse(e.getId(), e.getCourse().getId(), e.getKind(), e.getYear(), e.getTerm(),
                e.getDoctor(), e.isWithSolution(), e.getFileName(), e.getContentType(), e.getSizeBytes(),
                e.isApproved(), mine, e.getUploader().getUsername(), e.getCreatedAt());
    }

    /** PDF by its first bytes, or one of the images roadmap pictures accept. Anything else is refused. */
    static String fileType(byte[] d) {
        if (d.length >= 5 && d[0] == '%' && d[1] == 'P' && d[2] == 'D' && d[3] == 'F' && d[4] == '-') {
            return "application/pdf";
        }
        return StudyPlanService.imageType(d);
    }

    /** The uploaded name without any folder part or odd characters, with an extension that matches the file. */
    static String cleanFileName(String original, String type) {
        String ext = switch (type) {
            case "application/pdf" -> ".pdf";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        String name = original == null ? "" : original;
        name = name.substring(Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1);
        int dot = name.lastIndexOf('.');
        if (dot > 0) {
            name = name.substring(0, dot);
        }
        name = name.replaceAll("[\\p{Cntrl}\"<>:*?|]", "").strip();
        if (name.isEmpty()) {
            name = "exam";
        }
        int max = 150 - ext.length();
        return (name.length() > max ? name.substring(0, max) : name) + ext;
    }
}
