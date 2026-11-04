package com.engineeringmap.server.entity;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One student's up (+1) or down (-1) vote on a shared material. */
@Entity
@Table(name = "resource_votes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"resource_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ResourceVote {
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
    private User user;

    /** "value" is a reserved word in some SQL dialects, hence the explicit column name. */
    @Column(name = "vote_value", nullable = false)
    private int value;

    public ResourceVote(Resource resource, User user, int value) {
        this.resource = resource;
        this.user = user;
        this.value = value;
    }
}
