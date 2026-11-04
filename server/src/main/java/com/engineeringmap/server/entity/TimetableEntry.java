package com.engineeringmap.server.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One class meeting in a student's weekly timetable. */
@Entity
@Table(name = "timetable_entries")
@Getter
@Setter
@NoArgsConstructor
public class TimetableEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    /** Optional link to a catalogue course; the title is what the timetable shows. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Course course;

    @Column(nullable = false, length = 100)
    private String title;

    /** 0 = Sunday ... 6 = Saturday. */
    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek;

    /** Minutes after midnight. */
    @Column(name = "start_minute", nullable = false)
    private int startMinute;

    @Column(name = "end_minute", nullable = false)
    private int endMinute;

    @Column(length = 60)
    private String location;

    /** Index into the colour palette the client uses. */
    @Column(nullable = false)
    private int color;
}
