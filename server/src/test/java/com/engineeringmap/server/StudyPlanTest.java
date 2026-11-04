package com.engineeringmap.server;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

/** Creating, showing/hiding and renaming roadmaps (H2 "local" profile, seeded by V4/V5). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class StudyPlanTest {

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

    private List<String> slugs(JsonNode list) {
        List<String> out = new ArrayList<>();
        list.forEach(p -> out.add(p.get("slug").asText()));
        return out;
    }

    private String createBody(String nameAr, String nameEn, String copyFrom) throws Exception {
        ObjectNode body = json.createObjectNode().put("nameAr", nameAr).put("nameEn", nameEn);
        if (copyFrom != null) body.put("copyFrom", copyFrom);
        return json.writeValueAsString(body);
    }

    @Test
    void existingRoadmapsAreListedForEveryone() throws Exception {
        JsonNode plans = read(get("/api/plans"), status().isOk());
        assertThat(slugs(plans)).startsWith("cpe", "ee");
        assertThat(plans.get(0).get("nameEn").asText()).isEqualTo("Computer Engineering");
        assertThat(plans.get(0).get("visible").asBoolean()).isTrue();
    }

    @Test
    void copiedRoadmapStartsHiddenAndAppearsWhenShown() throws Exception {
        String admin = signUpAndLogin("planadmin", true);
        String student = signUpAndLogin("planstudent", false);

        JsonNode created = read(auth(post("/api/admin/plans"), admin)
                .content(createBody("هندسة الحاسوب 2026", "Computer Engineering 2026", "cpe")), status().isCreated());
        String slug = created.get("slug").asText();
        assertThat(slug).isEqualTo("computer-engineering-2026");
        assertThat(created.get("visible").asBoolean()).isFalse();

        // Hidden: only admins see it or its map; students can't plan on it.
        assertThat(slugs(read(get("/api/plans"), status().isOk()))).doesNotContain(slug);
        assertThat(slugs(read(auth(get("/api/plans"), admin), status().isOk()))).contains(slug);
        read(get("/api/maps/" + slug), status().isNotFound());
        read(auth(get("/api/maps/" + slug), student), status().isNotFound());
        read(auth(get("/api/planner?plan=" + slug), student), status().isNotFound());

        // The copy has the source's courses and arrows, with its own title.
        JsonNode cpe = read(get("/api/maps/cpe"), status().isOk()).get("content");
        JsonNode copy = read(auth(get("/api/maps/" + slug), admin), status().isOk());
        assertThat(copy.get("version").asInt()).isEqualTo(1);
        assertThat(copy.get("updatedBy").asText()).isEqualTo("planadmin");
        assertThat(copy.get("content").get("nodes").size()).isEqualTo(cpe.get("nodes").size());
        assertThat(copy.get("content").get("edges")).isEqualTo(cpe.get("edges"));
        assertThat(copy.get("content").get("nodes").get(0).get("label").asText()).isEqualTo("هندسة الحاسوب 2026");

        // Shown: everyone sees it and students can plan on it.
        JsonNode shown = read(auth(put("/api/admin/plans/" + slug), admin).content("{\"visible\":true}"), status().isOk());
        assertThat(shown.get("visible").asBoolean()).isTrue();
        assertThat(shown.get("nameEn").asText()).isEqualTo("Computer Engineering 2026"); // untouched
        assertThat(slugs(read(get("/api/plans"), status().isOk()))).contains(slug);
        read(get("/api/maps/" + slug), status().isOk());
        read(auth(put("/api/planner?plan=" + slug), student).content("{\"items\":[{\"courseId\":1,\"semester\":1}]}"),
                status().isOk());

        // Same English name again gets its own id.
        JsonNode again = read(auth(post("/api/admin/plans"), admin)
                .content(createBody("نسخة أخرى", "Computer Engineering 2026", "cpe")), status().isCreated());
        assertThat(again.get("slug").asText()).isEqualTo("computer-engineering-2026-2");
    }

    @Test
    void blankRoadmapCanBeBuiltRenamedAndReordered() throws Exception {
        String admin = signUpAndLogin("planadmin2", true);
        JsonNode created = read(auth(post("/api/admin/plans"), admin)
                .content(createBody("هندسة الميكاترونكس", "Mechatronics Engineering", null)), status().isCreated());
        String slug = created.get("slug").asText();
        assertThat(slug).isEqualTo("mechatronics-engineering");

        JsonNode map = read(auth(get("/api/maps/" + slug), admin), status().isOk());
        JsonNode content = map.get("content");
        assertThat(content.get("nodes").size()).isEqualTo(1);
        assertThat(content.get("nodes").get(0).get("root").asBoolean()).isTrue();
        assertThat(content.get("edges").size()).isZero();

        // The editor can add courses to it like any other map.
        ObjectNode next = content.deepCopy();
        ((ArrayNode) next.get("nodes")).add(json.createObjectNode().put("id", "c5").put("courseId", 5)
                .put("label", "Course 5").put("x", 0).put("y", 150).put("color", "#0f3460"));
        ((ArrayNode) next.get("edges")).add(json.createObjectNode().put("id", "root-c5").put("source", "root")
                .put("target", "c5").put("color", "#079cba"));
        ObjectNode publish = json.createObjectNode().put("baseVersion", 1);
        publish.set("content", next);
        read(auth(put("/api/admin/maps/" + slug), admin).content(json.writeValueAsString(publish)), status().isOk());

        JsonNode renamed = read(auth(put("/api/admin/plans/" + slug), admin)
                .content("{\"nameAr\":\"  الميكاترونكس  \",\"sortOrder\":0}"), status().isOk());
        assertThat(renamed.get("nameAr").asText()).isEqualTo("الميكاترونكس");
        assertThat(renamed.get("sortOrder").asInt()).isZero();
        assertThat(renamed.get("slug").asText()).isEqualTo(slug); // ids never change
    }

    @Test
    void onlyAdminsManageRoadmapsAndBadInputIsRejected() throws Exception {
        String student = signUpAndLogin("planstudent2", false);
        String admin = signUpAndLogin("planadmin3", true);
        String body = createBody("خطة", "Plan X", null);

        mvc.perform(post("/api/admin/plans").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(auth(post("/api/admin/plans"), student).content(body)).andExpect(status().isForbidden());
        mvc.perform(auth(put("/api/admin/plans/cpe"), student).content("{\"visible\":false}"))
                .andExpect(status().isForbidden());

        read(auth(post("/api/admin/plans"), admin).content(createBody("خطة", "Plan Y", "no-such-plan")),
                status().isNotFound());
        read(auth(post("/api/admin/plans"), admin).content(createBody(" ", "Plan Z", null)), status().isBadRequest());
        read(auth(put("/api/admin/plans/no-such-plan"), admin).content("{\"visible\":true}"), status().isNotFound());
        read(auth(put("/api/admin/plans/cpe"), admin).content("{\"nameEn\":\"   \"}"), status().isBadRequest());
        read(get("/api/maps/no-such-plan"), status().isNotFound());
        read(get("/api/maps/Bad_Slug"), status().isBadRequest());
    }
}
