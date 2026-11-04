package com.engineeringmap.server.security.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.engineeringmap.server.entity.User;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access.expiration}")
    private long accessTokenExpirationTime;

    public String generateToken(User user) {
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("roles", roles)
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpirationTime))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    /** Who an access token belongs to, read from its signed claims. */
    public record TokenUser(Long id, String username, List<String> roles) {
    }

    /**
     * Checks the signature and expiry once and returns the claims, or empty when the token is
     * invalid or expired. {@code id} is null for a token without a userId claim.
     */
    public java.util.Optional<TokenUser> parse(String token) {
        try {
            Claims claims = getClaims(token); // throws for a bad signature or an expired token
            Object id = claims.get("userId");
            Object roles = claims.get("roles");
            List<String> roleNames = roles instanceof List<?> list
                    ? list.stream().map(String::valueOf).toList()
                    : List.of();
            return java.util.Optional.of(new TokenUser(
                    id instanceof Number n ? n.longValue() : null, claims.getSubject(), roleNames));
        } catch (Exception e) {
            return java.util.Optional.empty();
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }
}