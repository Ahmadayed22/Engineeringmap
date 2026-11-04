package com.engineeringmap.server;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Base64;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.repo.PlannedCourseRepo;
import com.engineeringmap.server.repo.RoleRepo;
import com.engineeringmap.server.repo.StudyMapRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Roadmap card pictures and removing a roadmap (H2 "local" profile). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class StudyPlanImageAndRemovalTest {

    /** A real 1x1 PNG. */
    private static final byte[] PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;
    @Autowired StudyMapRepo mapRepo;
    @Autowired PlannedCourseRepo plannedRepo;

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

    private MockMultipartHttpServletRequestBuilder upload(String slug, byte[] bytes, String token) {
        MockMultipartHttpServletRequestBuilder b = multipart(HttpMethod.PUT, "/api/admin/plans/" + slug + "/image");
        b.file(new MockMultipartFile("file", "card.png", "image/png", bytes));
        if (token != null) b.header("Authorization", "Bearer " + token);
        return b;
    }

    private JsonNode read(MockHttpServletRequestBuilder b, ResultMatcher expected) throws Exception {
        String body = mvc.perform(b).andExpect(expected).andReturn().getResponse().getContentAsString();
        return body.isEmpty() ? null : json.readTree(body);
    }

    private String createPlan(String admin, String nameEn) throws Exception {
        return read(auth(post("/api/admin/plans"), admin)
                .content("{\"nameAr\":\"خطة\",\"nameEn\":\"" + nameEn + "\"}"), status().isCreated())
                .get("slug").asText();
    }

    @Test
    void adminSetsReplacesAndRemovesACardPicture() throws Exception {
        String admin = signUpAndLogin("imgadmin", true);
        String student = signUpAndLogin("imgstudent", false);
        String slug = createPlan(admin, "Picture Plan");

        // Only admins upload.
        mvc.perform(upload(slug, PNG, null)).andExpect(status().isUnauthorized());
        mvc.perform(upload(slug, PNG, student)).andExpect(status().isForbidden());

        JsonNode info = read(upload(slug, PNG, admin), status().isOk());
        long version = info.get("imageVersion").asLong();
        assertThat(version).isPositive();

        // Anyone can load it (an img tag sends no token), and it is cacheable.
        byte[] served = mvc.perform(get("/api/plans/" + slug + "/image"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("max-age=31536000")))
                .andReturn().getResponse().getContentAsByteArray();
        assertThat(served).isEqualTo(PNG);

        // Not an image (here SVG, which could carry script): refused, the old picture stays.
        byte[] svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes();
        JsonNode bad = read(upload(slug, svg, admin), status().isBadRequest());
        assertThat(bad.get("message").asText()).isEqualTo("Upload a JPG, PNG or WebP image");
        mvc.perform(get("/api/plans/" + slug + "/image")).andExpect(status().isOk());

        JsonNode removed = read(auth(delete("/api/admin/plans/" + slug + "/image"), admin), status().isOk());
        assertThat(removed.get("imageVersion").isNull()).isTrue();
        read(get("/api/plans/" + slug + "/image"), status().isNotFound());
    }

    @Test
    void removingARoadmapKeepsItsCourses() throws Exception {
        String admin = signUpAndLogin("rmadmin", true);
        String student = signUpAndLogin("rmstudent", false);
        String slug = createPlan(admin, "Plan To Remove");
        read(auth(put("/api/admin/plans/" + slug), admin).content("{\"visible\":true}"), status().isOk());
        read(auth(put("/api/planner?plan=" + slug), student)
                .content("{\"items\":[{\"courseId\":7,\"semester\":1}]}"), status().isOk());
        mvc.perform(upload(slug, PNG, admin)).andExpect(status().isOk());

        mvc.perform(auth(delete("/api/admin/plans/" + slug), student)).andExpect(status().isForbidden());
        mvc.perform(auth(delete("/api/admin/plans/" + slug), admin)).andExpect(status().isNoContent());

        JsonNode plans = read(get("/api/plans"), status().isOk());
        plans.forEach(p -> assertThat(p.get("slug").asText()).isNotEqualTo(slug));
        read(get("/api/maps/" + slug), status().isNotFound());
        read(get("/api/plans/" + slug + "/image"), status().isNotFound());
        assertThat(mapRepo.findTopByPlanOrderByVersionDesc(slug)).isEmpty();
        assertThat(plannedRepo.findAll()).noneMatch(p -> p.getPlan().equals(slug));
        // The course itself (and everything attached to it) is untouched.
        mvc.perform(get("/api/courses/7")).andExpect(status().isOk());

        read(auth(delete("/api/admin/plans/" + slug), admin), status().isNotFound());
    }
}
