package com.engineeringmap.server;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Date;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.repo.RoleRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * Requests are authenticated from the access token's signed claims (no user lookup per request).
 * Role changes therefore apply from the user's next token.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class TokenAuthTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;

    @Value("${jwt.secret}")
    String secret;

    private String signUp(String name) throws Exception {
        mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + name + "\",\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk());
        return login(name);
    }

    private String login(String name) throws Exception {
        String body = mvc.perform(post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("accessToken").asText();
    }

    private void setRoles(String name, RoleType... roles) {
        var user = userRepo.findByUsername(name).orElseThrow();
        user.setRoles(Set.of(roles).stream().map(r -> roleRepo.findByName(r).orElseThrow())
                .collect(java.util.stream.Collectors.toSet()));
        userRepo.save(user);
    }

    private int adminStatus(String token) throws Exception {
        return mvc.perform(get("/api/admin/reports").header("Authorization", "Bearer " + token))
                .andReturn().getResponse().getStatus();
    }

    @Test
    void roleChangesApplyFromTheNextToken() throws Exception {
        String before = signUp("tara");
        setRoles("tara", RoleType.USER, RoleType.ADMIN);
        // The old token still says USER only...
        org.assertj.core.api.Assertions.assertThat(adminStatus(before)).isEqualTo(403);
        // ...a new one (sign-in or refresh) carries ADMIN.
        String promoted = login("tara");
        org.assertj.core.api.Assertions.assertThat(adminStatus(promoted)).isEqualTo(200);

        setRoles("tara", RoleType.USER);
        org.assertj.core.api.Assertions.assertThat(adminStatus(login("tara"))).isEqualTo(403);
    }

    @Test
    void forgedOrOldStyleTokens() throws Exception {
        signUp("omid");
        Long id = userRepo.findByUsername("omid").orElseThrow().getId();
        Date exp = new Date(System.currentTimeMillis() + 60_000);

        // Claiming ADMIN with a key the server doesn't know: not signed in at all.
        String forged = Jwts.builder().setSubject("omid").claim("userId", id).claim("roles", List.of("ADMIN"))
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS256, "c29tZS1vdGhlci1zZWNyZXQta2V5LXRoYXQtaXMtbG9uZy1lbm91Z2g=")
                .compact();
        org.assertj.core.api.Assertions.assertThat(adminStatus(forged)).isEqualTo(401);

        // Expired: 401, so the client refreshes.
        String expired = Jwts.builder().setSubject("omid").claim("userId", id).claim("roles", List.of("USER"))
                .setExpiration(new Date(System.currentTimeMillis() - 1000)).signWith(SignatureAlgorithm.HS256, secret)
                .compact();
        mvc.perform(get("/api/timetable").header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized());

        // A token without the userId claim falls back to loading the user, and still works.
        String noId = Jwts.builder().setSubject("omid").claim("roles", List.of("USER")).setExpiration(exp)
                .signWith(SignatureAlgorithm.HS256, secret).compact();
        mvc.perform(get("/api/timetable").header("Authorization", "Bearer " + noId))
                .andExpect(status().isOk());
    }
}
