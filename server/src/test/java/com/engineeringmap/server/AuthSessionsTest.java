package com.engineeringmap.server;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.engineeringmap.server.entity.RefreshToken;
import com.engineeringmap.server.repo.RefreshTokenRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Each sign-in has its own refresh token, so one user can be signed in on several devices. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AuthSessionsTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired RefreshTokenRepo refreshTokenRepo;
    @Autowired UserRepo userRepo;

    private void signUp(String name) throws Exception {
        mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + name + "\",\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk());
    }

    /** Signs in as if from a new device; returns the response (accessToken, refreshToken). */
    private JsonNode signIn(String name) throws Exception {
        String body = mvc.perform(post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body);
    }

    private ResultActions refresh(String refreshToken) throws Exception {
        return mvc.perform(post("/api/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("refreshToken", refreshToken))));
    }

    private ResultActions logout(JsonNode session) throws Exception {
        return mvc.perform(post("/api/auth/logout").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + session.get("accessToken").asText())
                .content(json.writeValueAsString(
                        Map.of("refreshToken", session.get("refreshToken").asText()))));
    }

    private int tokenCount(String name) {
        return refreshTokenRepo.findByUserOrderByExpiryDateDescIdDesc(
                userRepo.findByUsername(name).orElseThrow()).size();
    }

    @Test
    void twoSignInsBothRefresh() throws Exception {
        signUp("phone_laptop");
        JsonNode phone = signIn("phone_laptop");
        JsonNode laptop = signIn("phone_laptop");
        assertThat(phone.get("refreshToken").asText()).isNotEqualTo(laptop.get("refreshToken").asText());

        // The phone keeps working after the laptop signed in.
        refresh(phone.get("refreshToken").asText()).andExpect(status().isOk())
                .andExpect(jsonPath("$.refreshToken").value(phone.get("refreshToken").asText()))
                .andExpect(jsonPath("$.userInfo.username").value("phone_laptop"));
        refresh(laptop.get("refreshToken").asText()).andExpect(status().isOk());
        assertThat(tokenCount("phone_laptop")).isEqualTo(2);
    }

    @Test
    void loggingOutOneDeviceLeavesTheOtherSignedIn() throws Exception {
        signUp("two_devices");
        JsonNode phone = signIn("two_devices");
        JsonNode laptop = signIn("two_devices");

        logout(laptop).andExpect(status().isOk());

        refresh(laptop.get("refreshToken").asText()).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Your session has expired. Please sign in again."));
        refresh(phone.get("refreshToken").asText()).andExpect(status().isOk());
        assertThat(tokenCount("two_devices")).isEqualTo(1);
    }

    @Test
    void logoutCannotRevokeAnotherUsersToken() throws Exception {
        signUp("victim");
        signUp("attacker");
        JsonNode victim = signIn("victim");
        JsonNode attacker = signIn("attacker");

        mvc.perform(post("/api/auth/logout").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + attacker.get("accessToken").asText())
                .content(json.writeValueAsString(
                        Map.of("refreshToken", victim.get("refreshToken").asText()))))
                .andExpect(status().isOk());

        refresh(victim.get("refreshToken").asText()).andExpect(status().isOk());
    }

    @Test
    void logoutWithoutBodyRevokesNothing() throws Exception {
        signUp("no_body");
        JsonNode session = signIn("no_body");

        mvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer " + session.get("accessToken").asText()))
                .andExpect(status().isOk());

        refresh(session.get("refreshToken").asText()).andExpect(status().isOk());
    }

    @Test
    void expiredTokenIsRejectedAndDeleted() throws Exception {
        signUp("expired");
        String token = signIn("expired").get("refreshToken").asText();
        RefreshToken stored = refreshTokenRepo.findByToken(token).orElseThrow();
        stored.setExpiryDate(Instant.now().minus(1, ChronoUnit.MINUTES));
        refreshTokenRepo.save(stored);

        refresh(token).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Your session has expired. Please sign in again."));
        assertThat(refreshTokenRepo.findByToken(token)).isEmpty();
    }

    @Test
    void unknownTokenIsRejected() throws Exception {
        refresh("not-a-real-token").andExpect(status().isForbidden());
    }

    @Test
    void signInCleansUpExpiredTokensAndCapsSessions() throws Exception {
        signUp("many_devices");
        String expired = signIn("many_devices").get("refreshToken").asText();
        RefreshToken stored = refreshTokenRepo.findByToken(expired).orElseThrow();
        stored.setExpiryDate(Instant.now().minus(1, ChronoUnit.MINUTES));
        refreshTokenRepo.save(stored);

        String first = signIn("many_devices").get("refreshToken").asText();
        // The expired token was removed by that sign-in.
        assertThat(refreshTokenRepo.findByToken(expired)).isEmpty();

        for (int i = 0; i < 10; i++) {
            signIn("many_devices");
        }
        // At most 10 sign-ins are kept; the oldest one went first.
        assertThat(tokenCount("many_devices")).isEqualTo(10);
        refresh(first).andExpect(status().isForbidden());
    }
}
