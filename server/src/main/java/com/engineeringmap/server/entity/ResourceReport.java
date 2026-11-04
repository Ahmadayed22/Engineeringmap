package com.engineeringmap.server.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A student flagging a material as broken, wrong or spam, for admins to review. */
@Entity
@Table(name = "resource_reports")
@Getter
@Setter
@NoArgsConstructor
public class ResourceReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User reporter;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false)
    private boolean resolved = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public ResourceReport(Resource resource, User reporter, String reason) {
        this.resource = resource;
        this.reporter = reporter;
        this.reason = reason;
    }
}
