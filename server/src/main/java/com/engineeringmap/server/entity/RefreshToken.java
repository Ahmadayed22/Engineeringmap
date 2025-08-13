package com.engineeringmap.server.entity;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false , unique =  true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;
    
    @OneToOne
    @JoinColumn(name = "user_id" , referencedColumnName = "id")
    private User user;

      public RefreshToken(String token, Instant expiryDate, User user) {
        this.token = token;
        this.expiryDate = expiryDate;
        this.user = user;
    }
     
}
