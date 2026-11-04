package com.engineeringmap.server.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** In-app notification, e.g. "sara replied to your comment". */
@Entity
@Table(name = "notifications", indexes = @Index(columnList = "recipient_id, is_read"))
@Getter
@Setter
@NoArgsConstructor
public class Notification {
    public static final String COMMENT_REPLY = "COMMENT_REPLY";
    // For the types below the message is only the name of the thing; the client words it.
    public static final String MATERIAL_APPROVED = "MATERIAL_APPROVED";
    public static final String MATERIAL_REJECTED = "MATERIAL_REJECTED";
    public static final String EXAM_APPROVED = "EXAM_APPROVED";
    public static final String EXAM_REJECTED = "EXAM_REJECTED";
    /** An exam on the student's countdown is 3 days away. */
    public static final String EXAM_SOON = "EXAM_SOON";
    /** An exam on the student's countdown is within a day. */
    public static final String EXAM_TOMORROW = "EXAM_TOMORROW";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User recipient;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 300)
    private String message;

    private Long courseId;

    private Long commentId;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
