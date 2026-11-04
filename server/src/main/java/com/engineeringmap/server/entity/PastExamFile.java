package com.engineeringmap.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** The uploaded file of a past exam, kept apart so exam lists never load it. */
@Entity
@Table(name = "past_exam_files")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PastExamFile {
    @Id
    @Column(name = "exam_id")
    private Long examId;

    @Column(nullable = false)
    private byte[] data;
}
