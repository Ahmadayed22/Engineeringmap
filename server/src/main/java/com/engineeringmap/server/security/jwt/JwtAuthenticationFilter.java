package com.engineeringmap.server.security.jwt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.engineeringmap.server.security.UserDetailsImpl;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(UserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = authHeader.substring(7);
            // An expired or tampered token must not break the request: we simply leave it
            // unauthenticated, so public endpoints still work and protected ones answer 401
            // (which lets the client refresh its token).
            jwtUtil.parse(token).ifPresent(claims -> {
                try {
                    UserDetails userDetails = fromClaims(claims);
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } catch (UsernameNotFoundException e) {
                    log.debug("Token refers to a user that no longer exists");
                }
            });
        }

        filterChain.doFilter(request, response);
    }

    /**
     * The signed access token already says who the user is and which roles they have, so the
     * database isn't read on every request. The trade-off: a role change applies when the user's
     * access token is next renewed (at most jwt.access.expiration, 15 minutes by default).
     * Tokens without a userId claim fall back to loading the user.
     */
    private UserDetails fromClaims(JwtUtil.TokenUser claims) {
        if (claims.id() == null || claims.username() == null) {
            return userDetailsService.loadUserByUsername(claims.username());
        }
        List<SimpleGrantedAuthority> authorities = claims.roles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        return new UserDetailsImpl(claims.id(), claims.username(), null, authorities);
    }
}
