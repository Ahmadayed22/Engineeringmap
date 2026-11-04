package com.engineeringmap.server;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.repo.RoleRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Full HTTP flows against the in-memory H2 "local" profile. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class CommunityFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;

    private String signUpAndLogin(String name) throws Exception {
        mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + name + "\",\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk());
        return login(name);
    }

    /** Roles live in the access token, so a promoted user needs a fresh one. */
    private String login(String name) throws Exception {
        String body = mvc.perform(post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("accessToken").asText();
    }

    private static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder b, String token) {
        return b.header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON);
    }

    private JsonNode body(MockHttpServletRequestBuilder b) throws Exception {
        return json.readTree(mvc.perform(b).andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString());
    }

    @Test
    void repliesNotifyTheAuthorAndDeleteWithTheirThread() throws Exception {
        String ali = signUpAndLogin("ali");
        String mona = signUpAndLogin("mona");

        long parent = body(auth(post("/api/comments"), ali).content("{\"courseId\":5,\"content\":\"Any tips?\"}"))
                .get("id").asLong();
        JsonNode reply = body(auth(post("/api/comments"), mona)
                .content("{\"courseId\":5,\"content\":\"Do past exams\",\"parentId\":" + parent + "}"));
        assertThat(reply.get("parentId").asLong()).isEqualTo(parent);

        // Replying to a reply stays in the same one-level thread.
        JsonNode nested = body(auth(post("/api/comments"), ali)
                .content("{\"courseId\":5,\"content\":\"Thanks!\",\"parentId\":" + reply.get("id").asLong() + "}"));
        assertThat(nested.get("parentId").asLong()).isEqualTo(parent);

        assertThat(body(auth(get("/api/notifications/unread-count"), ali)).get("count").asLong()).isEqualTo(1);
        JsonNode list = body(auth(get("/api/notifications"), ali));
        assertThat(list.get(0).get("message").asText()).isEqualTo("mona replied to your comment");
        assertThat(list.get(0).get("courseId").asLong()).isEqualTo(5);
        body(auth(post("/api/notifications/read-all"), ali));
        assertThat(body(auth(get("/api/notifications/unread-count"), ali)).get("count").asLong()).isZero();
        // Mona was notified about Ali's reply in her thread? No: she replied to Ali; Ali's
        // follow-up attaches to Ali's own thread, so nobody else is notified.
        assertThat(body(auth(get("/api/notifications/unread-count"), mona)).get("count").asLong()).isZero();

        // Deleting the thread removes replies too.
        body(auth(delete("/api/comments/" + parent), ali));
        assertThat(body(get("/api/comments/course/5")).size()).isZero();
    }

    @Test
    void materialsCanBeVotedOnAndReported() throws Exception {
        String sam = signUpAndLogin("sam");
        String lina = signUpAndLogin("lina");
        // Script URLs are rejected (they would run when another student clicks the link).
        mvc.perform(auth(post("/api/resource/course/7"), sam)
                .content("{\"name\":\"x\",\"books\":\"javascript:alert(1)\",\"courseId\":7}"))
                .andExpect(status().isBadRequest());

        long resourceId = body(auth(post("/api/resource/course/7"), sam)
                .content("{\"name\":\"Summary\",\"summaries\":\"https://example.com/s\",\"courseId\":7}"))
                .get("id").asLong();

        // A student's material waits for an admin: only its author sees it, nobody can vote on it.
        assertThat(body(get("/api/resource/course/7")).size()).isZero();
        assertThat(body(auth(get("/api/resource/course/7"), lina)).size()).isZero();
        assertThat(body(auth(get("/api/resource/course/7"), sam)).get(0).get("approved").asBoolean()).isFalse();
        mvc.perform(get("/api/resource/" + resourceId)).andExpect(status().isNotFound());
        mvc.perform(auth(post("/api/resource/" + resourceId + "/vote"), lina).content("{\"value\":1}"))
                .andExpect(status().isNotFound());
        String nora = signUpAndLogin("nora");
        mvc.perform(auth(post("/api/admin/materials/" + resourceId + "/approve"), nora))
                .andExpect(status().isForbidden());
        var noraUser = userRepo.findByUsername("nora").orElseThrow();
        noraUser.setRoles(Set.of(roleRepo.findByName(RoleType.USER).orElseThrow(),
                roleRepo.findByName(RoleType.ADMIN).orElseThrow()));
        userRepo.save(noraUser);
        nora = login("nora");
        JsonNode pendingMaterials = body(auth(get("/api/admin/materials/pending"), nora));
        assertThat(pendingMaterials.get(0).get("category").asText()).isEqualTo("summaries");
        assertThat(pendingMaterials.get(0).get("uploader").asText()).isEqualTo("sam");
        body(auth(post("/api/admin/materials/" + resourceId + "/approve"), nora));
        assertThat(body(get("/api/resource/course/7")).get(0).get("approved").asBoolean()).isTrue();
        assertThat(body(auth(get("/api/notifications"), sam)).get(0).get("type").asText())
                .isEqualTo("MATERIAL_APPROVED");

        assertThat(body(auth(post("/api/resource/" + resourceId + "/vote"), lina).content("{\"value\":1}"))
                .get("score").asLong()).isEqualTo(1);
        assertThat(body(auth(post("/api/resource/" + resourceId + "/vote"), sam).content("{\"value\":1}"))
                .get("score").asLong()).isEqualTo(2);
        // Changing a vote replaces it rather than adding another.
        assertThat(body(auth(post("/api/resource/" + resourceId + "/vote"), lina).content("{\"value\":-1}"))
                .get("score").asLong()).isEqualTo(0);
        mvc.perform(auth(post("/api/resource/" + resourceId + "/vote"), lina).content("{\"value\":5}"))
                .andExpect(status().isBadRequest());

        JsonNode listed = body(auth(get("/api/resource/course/7"), lina));
        assertThat(listed.get(0).get("score").asLong()).isZero();
        assertThat(listed.get(0).get("myVote").asInt()).isEqualTo(-1);
        assertThat(body(get("/api/resource/course/7")).get(0).get("myVote").asInt()).isZero();

        body(auth(post("/api/resource/" + resourceId + "/report"), lina).content("{\"reason\":\"Broken link\"}"));
        mvc.perform(auth(post("/api/resource/" + resourceId + "/report"), lina).content("{\"reason\":\"again\"}"))
                .andExpect(status().isBadRequest());

        // Regular users can't see the moderation queue; admins can.
        mvc.perform(auth(get("/api/admin/reports"), lina)).andExpect(status().isForbidden());
        var linaUser = userRepo.findByUsername("lina").orElseThrow();
        linaUser.setRoles(Set.of(roleRepo.findByName(RoleType.USER).orElseThrow(),
                roleRepo.findByName(RoleType.ADMIN).orElseThrow()));
        userRepo.save(linaUser);
        lina = login("lina");
        JsonNode reports = body(auth(get("/api/admin/reports"), lina));
        assertThat(reports.get(0).get("reason").asText()).isEqualTo("Broken link");
        body(auth(post("/api/admin/reports/" + reports.get(0).get("id").asLong() + "/resolve"), lina));
        assertThat(body(auth(get("/api/admin/reports"), lina)).size()).isZero();

        // Deleting a voted, reported material works (votes and reports cascade).
        mvc.perform(auth(delete("/api/resource/" + resourceId), sam)).andExpect(status().isNoContent());
    }

    @Test
    void ratingsPlannerAndSharing() throws Exception {
        String omar = signUpAndLogin("omar");
        String huda = signUpAndLogin("huda");

        body(auth(put("/api/courses/9/rating"), omar).content("{\"difficulty\":4,\"workload\":2}"));
        JsonNode summary = body(auth(put("/api/courses/9/rating"), huda).content("{\"difficulty\":2,\"workload\":4}"));
        assertThat(summary.get("count").asLong()).isEqualTo(2);
        assertThat(summary.get("avgDifficulty").asDouble()).isEqualTo(3.0);
        assertThat(summary.get("myDifficulty").asInt()).isEqualTo(2);
        assertThat(body(get("/api/courses/9/ratings")).get("myDifficulty").isNull()).isTrue();
        mvc.perform(auth(put("/api/courses/9/rating"), omar).content("{\"difficulty\":9,\"workload\":2}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/courses/9/rating").contentType(MediaType.APPLICATION_JSON)
                .content("{\"difficulty\":3,\"workload\":3}")).andExpect(status().isUnauthorized());

        JsonNode plan = body(auth(put("/api/planner?plan=cpe"), omar)
                .content("{\"items\":[{\"courseId\":3,\"semester\":1},{\"courseId\":4,\"semester\":2}]}"));
        assertThat(plan.size()).isEqualTo(2);
        assertThat(body(auth(get("/api/planner?plan=cpe"), omar)).get(1).get("semester").asInt()).isEqualTo(2);
        assertThat(body(auth(get("/api/planner?plan=ee"), omar)).size()).isZero();
        mvc.perform(auth(put("/api/planner?plan=cpe"), omar)
                .content("{\"items\":[{\"courseId\":3,\"semester\":1},{\"courseId\":3,\"semester\":2}]}"))
                .andExpect(status().isBadRequest());
        // Unknown roadmap: 404; not even a valid roadmap id: 400.
        mvc.perform(auth(get("/api/planner?plan=hack"), omar)).andExpect(status().isNotFound());
        mvc.perform(auth(get("/api/planner?plan=Not_A_Plan"), omar)).andExpect(status().isBadRequest());

        body(auth(post("/api/courses/3/complete"), omar).content("{\"completed\":true}"));
        String token = body(auth(post("/api/users/me/share"), omar)).get("token").asText();
        assertThat(body(auth(post("/api/users/me/share"), omar)).get("token").asText()).isEqualTo(token);
        JsonNode shared = body(get("/api/share/" + token));
        assertThat(shared.get("username").asText()).isEqualTo("omar");
        assertThat(shared.get("completedCourseIds").get(0).asLong()).isEqualTo(3);
        assertThat(shared.has("email")).isFalse();

        mvc.perform(auth(delete("/api/users/me/share"), omar)).andExpect(status().isNoContent());
        mvc.perform(get("/api/share/" + token)).andExpect(status().isNotFound());
    }
}
