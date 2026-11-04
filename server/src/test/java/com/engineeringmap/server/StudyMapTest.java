package com.engineeringmap.server;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Set;
import java.util.function.Consumer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.repo.RoleRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/** The admin-editable study maps, against the H2 "local" profile (seeded by migration V4). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class StudyMapTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;

    private String signUpAndLogin(String name, boolean admin) throws Exception {
        mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + name + "\",\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk());
        if (admin) {
            var user = userRepo.findByUsername(name).orElseThrow();
            user.setRoles(Set.of(roleRepo.findByName(RoleType.USER).orElseThrow(),
                    roleRepo.findByName(RoleType.ADMIN).orElseThrow()));
            userRepo.save(user);
        }
        String body = mvc.perform(post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("accessToken").asText();
    }

    private static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder b, String token) {
        return b.header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON);
    }

    private JsonNode read(MockHttpServletRequestBuilder b, ResultMatcher expected) throws Exception {
        String body = mvc.perform(b).andExpect(expected).andReturn().getResponse().getContentAsString();
        return body.isEmpty() ? null : json.readTree(body);
    }

    private JsonNode currentMap(String plan) throws Exception {
        return read(get("/api/maps/" + plan), status().isOk());
    }

    private String publishBody(int baseVersion, JsonNode content) throws Exception {
        ObjectNode body = json.createObjectNode();
        body.put("baseVersion", baseVersion);
        body.set("content", content);
        return json.writeValueAsString(body);
    }

    /** Publishes a modified copy of the current map; expects a 400 with a message starting with `message`. */
    private void expectRejected(String admin, Consumer<ObjectNode> change, String message) throws Exception {
        JsonNode current = currentMap("cpe");
        ObjectNode content = current.get("content").deepCopy();
        change.accept(content);
        JsonNode error = read(auth(put("/api/admin/maps/cpe"), admin)
                .content(publishBody(current.get("version").asInt(), content)), status().isBadRequest());
        assertThat(error.get("message").asText()).startsWith(message);
    }

    private static ObjectNode node(ObjectMapper json, String id, long courseId, String label) {
        return json.createObjectNode().put("id", id).put("courseId", courseId).put("label", label)
                .put("x", 10).put("y", 20).put("color", "#0f3460");
    }

    private static ObjectNode edge(ObjectMapper json, String id, String source, String target) {
        return json.createObjectNode().put("id", id).put("source", source).put("target", target)
                .put("color", "#079cba");
    }

    @Test
    void seededMapsArePublicButOnlyAdminsPublish() throws Exception {
        JsonNode cpe = currentMap("cpe");
        assertThat(cpe.get("plan").asText()).isEqualTo("cpe");
        assertThat(cpe.get("content").get("nodes").size()).isGreaterThan(50);
        assertThat(cpe.get("content").get("nodes").get(0).get("root").asBoolean()).isTrue();
        assertThat(currentMap("ee").get("content").get("edges").size()).isGreaterThan(50);
        read(get("/api/maps/other"), status().isNotFound());
        read(get("/api/maps/Not_A_Plan"), status().isBadRequest());

        String body = publishBody(cpe.get("version").asInt(), cpe.get("content"));
        mvc.perform(put("/api/admin/maps/cpe").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
        String student = signUpAndLogin("mapstudent", false);
        mvc.perform(auth(put("/api/admin/maps/cpe"), student).content(body)).andExpect(status().isForbidden());
        mvc.perform(auth(get("/api/admin/maps/cpe/versions"), student)).andExpect(status().isForbidden());
    }

    @Test
    void seededMapsPassEveryRule() throws Exception {
        // An admin's first publish must not fail because of something already in the 2022 maps.
        String admin = signUpAndLogin("mapadmin0", true);
        for (String plan : new String[] {"cpe", "ee"}) {
            JsonNode current = currentMap(plan);
            read(auth(put("/api/admin/maps/" + plan), admin)
                    .content(publishBody(current.get("version").asInt(), current.get("content"))), status().isOk());
            assertThat(currentMap(plan).get("content")).isEqualTo(current.get("content"));
        }
    }

    @Test
    void adminEditsPublishesAndRestores() throws Exception {
        String admin = signUpAndLogin("mapadmin", true);
        JsonNode original = currentMap("ee");
        int v = original.get("version").asInt();

        // Remove one course box (and its arrows), add a new one under the banner.
        ObjectNode content = original.get("content").deepCopy();
        ArrayNode nodes = (ArrayNode) content.get("nodes");
        ArrayNode edges = (ArrayNode) content.get("edges");
        String removedId = nodes.get(nodes.size() - 1).get("id").asText();
        long removedCourse = nodes.get(nodes.size() - 1).get("courseId").asLong();
        nodes.remove(nodes.size() - 1);
        for (int i = edges.size() - 1; i >= 0; i--) {
            if (edges.get(i).get("source").asText().equals(removedId)
                    || edges.get(i).get("target").asText().equals(removedId)) {
                edges.remove(i);
            }
        }
        nodes.add(node(json, "newCourse", 150, "  مادة جديدة  "));
        edges.add(edge(json, "root-newCourse", "root", "newCourse").put("coreq", true));

        JsonNode published = read(auth(put("/api/admin/maps/ee"), admin).content(publishBody(v, content)),
                status().isOk());
        assertThat(published.get("version").asInt()).isEqualTo(v + 1);
        assertThat(published.get("updatedBy").asText()).isEqualTo("mapadmin");

        JsonNode now = currentMap("ee");
        assertThat(now.get("version").asInt()).isEqualTo(v + 1);
        JsonNode added = now.get("content").get("nodes").get(now.get("content").get("nodes").size() - 1);
        assertThat(added.get("label").asText()).isEqualTo("مادة جديدة"); // trimmed
        assertThat(added.has("root")).isFalse(); // false flags aren't stored
        assertThat(now.get("content").toString()).doesNotContain(removedId + "\"");
        // Taking a course off the map keeps the course itself (and its comments, grades...).
        mvc.perform(get("/api/courses/" + removedCourse)).andExpect(status().isOk());

        // Publishing on top of an old version is refused.
        mvc.perform(auth(put("/api/admin/maps/ee"), admin).content(publishBody(v, content)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.startsWith("The map was changed")));

        JsonNode versions = read(auth(get("/api/admin/maps/ee/versions"), admin), status().isOk());
        assertThat(versions.get(0).get("version").asInt()).isEqualTo(v + 1);
        assertThat(versions.get(0).get("author").asText()).isEqualTo("mapadmin");

        // Restoring the old version publishes it again as the newest.
        JsonNode restored = read(auth(post("/api/admin/maps/ee/versions/" + v + "/restore"), admin), status().isOk());
        assertThat(restored.get("version").asInt()).isEqualTo(v + 2);
        assertThat(restored.get("content")).isEqualTo(original.get("content"));
    }

    @Test
    void adminCreatesCoursesForTheMapWithoutLeakingErrors() throws Exception {
        String admin = signUpAndLogin("mapadmin3", true);
        String course = "{\"name\":\"Map Editor Course\",\"label\":\"Map Editor Course\","
                + "\"description\":\"Map Editor Course\",\"creditHours\":3}";
        JsonNode created = read(auth(post("/api/courses"), admin).content(course), status().isCreated());
        assertThat(created.get("id").asLong()).isGreaterThan(200); // after the hand-inserted demo rows

        JsonNode duplicate = read(auth(post("/api/courses"), admin).content(course), status().isBadRequest());
        assertThat(duplicate.get("message").asText()).isEqualTo("Course name already exists: Map Editor Course");
        JsonNode missing = read(auth(put("/api/courses/999999"), admin).content(course), status().isNotFound());
        assertThat(missing.get("message").asText()).isEqualTo("Course not found");
    }

    @Test
    void invalidMapsAreRejected() throws Exception {
        String admin = signUpAndLogin("mapadmin2", true);
        expectRejected(admin, c -> {
            // An arrow back from a course to the one before it.
            JsonNode first = c.get("edges").get(c.get("edges").size() - 1);
            ((ArrayNode) c.get("edges")).add(edge(json, "loop", first.get("target").asText(), first.get("source").asText()));
        }, "Prerequisites go in a circle");
        expectRejected(admin, c -> ((ArrayNode) c.get("nodes")).add(node(json, "ghost", 999_999, "Ghost")),
                "Unknown course id");
        expectRejected(admin, c -> ((ArrayNode) c.get("edges")).add(edge(json, "dangling", "root", "nowhere")),
                "Arrow points to a box that doesn't exist");
        expectRejected(admin, c -> ((ObjectNode) c.get("nodes").get(1)).put("color", "red"),
                "content.nodes[1].color");
        expectRejected(admin, c -> ((ObjectNode) c.get("nodes").get(1)).remove("courseId"), "Box has no course");
        expectRejected(admin, c -> ((ArrayNode) c.get("nodes")).add(
                json.createObjectNode().put("id", "root2").put("label", "Second").put("x", 0).put("y", 0)
                        .put("color", "#000000").put("root", true)),
                "The map needs exactly one title banner");
        expectRejected(admin, c -> {
            JsonNode n = c.get("nodes").get(1);
            ((ArrayNode) c.get("nodes")).add(n.deepCopy());
        }, "Two boxes on the map have the same id");
    }
}
