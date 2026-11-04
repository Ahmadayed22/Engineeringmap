package com.engineeringmap.server.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A roadmap shown on the home page (e.g. Computer Engineering). Its map lives in study_maps
 * under the same slug. Hidden roadmaps are only visible to admins.
 */
@Entity
@Table(name = "study_plans",
        uniqueConstraints = @UniqueConstraint(name = "uk_study_plans_slug", columnNames = "slug"))
@Getter
@Setter
@NoArgsConstructor
public class StudyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Short id used in URLs and by maps and planner rows. Never changes. */
    @Column(nullable = false, length = 40, updatable = false)
    private String slug;

    @Column(name = "name_ar", nullable = false, length = 150)
    private String nameAr;

    @Column(name = "name_en", nullable = false, length = 150)
    private String nameEn;

    @Column(nullable = false)
    private boolean visible;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** When the card picture last changed (epoch ms); null = no uploaded picture. */
    @Column(name = "image_version")
    private Long imageVersion;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
