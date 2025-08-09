package com.engineeringmap.server.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resource")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String books;

    @Column(length = 1000)
    private String summaries;

    @Column(length = 1000)
    private String slides;

    @Column(length = 1000)
    private String labs;

    @Column(length = 1000)
    private String exams;

    @Column(length = 1000)
    private String videos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}
