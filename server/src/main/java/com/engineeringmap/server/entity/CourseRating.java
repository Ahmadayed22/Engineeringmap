package com.engineeringmap.server.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** How hard a course was (1-5) and how much work it took (1-5), one rating per student. */
@Entity
@Table(name = "course_ratings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class CourseRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false)
    private int difficulty;

    @Column(nullable = false)
    private int workload;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
