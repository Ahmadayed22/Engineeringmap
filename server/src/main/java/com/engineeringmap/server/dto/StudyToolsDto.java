package com.engineeringmap.server.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request/response shapes for the timetable, the past exam bank, exam dates and approvals. */
public final class StudyToolsDto {
    private StudyToolsDto() {
    }

    /** Exam kinds shared by past exams and exam dates. */
    public static final String KIND_PATTERN = "^(FIRST|SECOND|MIDTERM|FINAL|QUIZ|OTHER)$";
    public static final String TERM_PATTERN = "^(FIRST|SECOND|SUMMER)$";

    // ----- Weekly timetable -----
    /** day: 0 = Sunday ... 6 = Saturday; start/end: minutes after midnight. */
    public record TimetableItem(
            Long courseId,
            @NotBlank @Size(max = 100) String title,
            @NotNull @Min(0) @Max(6) Integer day,
            @NotNull @Min(0) @Max(1439) Integer start,
            @NotNull @Min(1) @Max(1440) Integer end,
            @Size(max = 60) String location,
            @NotNull @Min(0) @Max(11) Integer color) {
    }

    public record TimetableRequest(@NotNull @Size(max = 80) List<@Valid TimetableItem> items) {
    }

    // ----- Past exam bank -----
    /** Sent as form fields next to the uploaded file. */
    public record PastExamUpload(
            @NotNull @Pattern(regexp = KIND_PATTERN) String kind,
            @NotNull @Min(1990) @Max(2100) Integer year,
            @NotNull @Pattern(regexp = TERM_PATTERN) String term,
            @Size(max = 100) String doctor,
            Boolean withSolution) {
    }

    /** mine: the viewer uploaded it (they may delete it); approved=false only ever reaches the uploader and admins. */
    public record PastExamResponse(Long id, Long courseId, String kind, int year, String term, String doctor,
            boolean withSolution, String fileName, String contentType, int sizeBytes, boolean approved,
            boolean mine, String uploader, LocalDateTime createdAt) {
    }

    /** An upload waiting in the admin queue. */
    public record PendingExam(Long id, Long courseId, String courseName, String kind, int year, String term,
            String doctor, boolean withSolution, String fileName, String contentType, int sizeBytes,
            String uploader, LocalDateTime createdAt) {
    }

    /** A material link waiting in the admin queue; category is books, summaries, slides, labs, exams or videos. */
    public record PendingMaterial(Long id, Long courseId, String courseName, String name, String category,
            String url, String uploader) {
    }

    // ----- Exam dates (countdown) -----
    public record ExamDateRequest(
            Long courseId,
            @NotBlank @Size(max = 100) String title,
            @NotNull @Pattern(regexp = KIND_PATTERN) String kind,
            @NotNull Instant startsAt,
            @Size(max = 60) String location) {
    }

    public record ExamDateResponse(Long id, Long courseId, String title, String kind, Instant startsAt,
            String location) {
    }
}
