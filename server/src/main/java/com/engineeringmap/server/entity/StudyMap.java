package com.engineeringmap.server.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One published version of a study-plan map ("cpe" or "ee"). Every publish adds a row; the
 * map students see is the highest version. The nodes and edges are stored as one JSON
 * document (see StudyMapDto.MapContent), validated by StudyMapService before saving.
 */
@Entity
@Table(name = "study_maps",
        uniqueConstraints = @UniqueConstraint(name = "uk_study_maps_plan_version", columnNames = {"plan", "version"}))
@Getter
@Setter
@NoArgsConstructor
public class StudyMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String plan;

    @Column(nullable = false)
    private int version;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    /** Null for the versions seeded by the database migration. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
