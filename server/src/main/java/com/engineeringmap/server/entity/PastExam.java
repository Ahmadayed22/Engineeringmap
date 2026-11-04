package com.engineeringmap.server.entity;

import java.time.LocalDateTime;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** An old exam paper for a course. The file itself is in {@link PastExamFile}. */
@Entity
@Table(name = "past_exams")
@Getter
@Setter
@NoArgsConstructor
public class PastExam {
    public static final Set<String> KINDS = Set.of("FIRST", "SECOND", "MIDTERM", "FINAL", "QUIZ", "OTHER");
    public static final Set<String> TERMS = Set.of("FIRST", "SECOND", "SUMMER");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploader_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User uploader;

    /** One of {@link #KINDS}. */
    @Column(nullable = false, length = 20)
    private String kind;

    @Column(name = "exam_year", nullable = false)
    private int year;

    /** One of {@link #TERMS}. */
    @Column(nullable = false, length = 20)
    private String term;

    @Column(length = 100)
    private String doctor;

    @Column(name = "with_solution", nullable = false)
    private boolean withSolution;

    @Column(name = "file_name", nullable = false, length = 150)
    private String fileName;

    @Column(name = "content_type", nullable = false, length = 40)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private int sizeBytes;

    /** False until an admin approves a student's upload. */
    @Column(nullable = false)
    private boolean approved;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
