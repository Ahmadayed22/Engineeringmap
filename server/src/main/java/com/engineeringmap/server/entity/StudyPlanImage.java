package com.engineeringmap.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** The picture on a roadmap's home-page card. Kept apart from StudyPlan so listing roadmaps never loads it. */
@Entity
@Table(name = "study_plan_images")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StudyPlanImage {

    /** The roadmap's slug. */
    @Id
    @Column(length = 40)
    private String plan;

    @Column(name = "content_type", nullable = false, length = 40)
    private String contentType;

    @Column(nullable = false)
    private byte[] data;
}
