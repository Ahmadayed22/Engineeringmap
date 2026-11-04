package com.engineeringmap.server.entity;

import java.time.Instant;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One of a student's own upcoming exams (private to them). */
@Entity
@Table(name = "exam_dates")
@Getter
@Setter
@NoArgsConstructor
public class ExamDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Course course;

    @Column(nullable = false, length = 100)
    private String title;

    /** Same values as {@link PastExam#KINDS}. */
    @Column(nullable = false, length = 20)
    private String kind;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(length = 60)
    private String location;

    /** 0 = no reminder yet, 1 = "3 days left" sent, 2 = "tomorrow" sent. */
    @Column(name = "reminders_sent", nullable = false)
    private int remindersSent;
}
