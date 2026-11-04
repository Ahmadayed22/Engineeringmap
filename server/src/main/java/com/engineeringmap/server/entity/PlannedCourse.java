package com.engineeringmap.server.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A course a student plans to take in a future semester (1 = next semester). */
@Entity
@Table(name = "planned_courses",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id", "plan"}))
@Getter
@Setter
@NoArgsConstructor
public class PlannedCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Course course;

    /** Which study plan this belongs to ("cpe" or "ee"). */
    @Column(nullable = false, length = 10)
    private String plan;

    @Column(nullable = false)
    private int semester;
}
