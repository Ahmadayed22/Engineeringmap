package com.engineeringmap.server;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.repo.RoleRepo;
import com.engineeringmap.server.repo.UserRepo;
import com.engineeringmap.server.service.ExamDateService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Timetable, past exam bank (with admin approval) and exam dates with reminders, over HTTP on H2. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class StudyToolsTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepo userRepo;
    @Autowired RoleRepo roleRepo;
    @Autowired ExamDateService examDateService;

    private static final byte[] PDF = "%PDF-1.4\n% test exam\n".getBytes(StandardCharsets.US_ASCII);

    private String signUpAndLogin(String name) throws Exception {
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

    private void makeAdmin(String name) {
        var user = userRepo.findByUsername(name).orElseThrow();
        user.setRoles(Set.of(roleRepo.findByName(RoleType.USER).orElseThrow(),
                roleRepo.findByName(RoleType.ADMIN).orElseThrow()));
        userRepo.save(user);
    }

    private static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder b, String token) {
        return b.header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON);
    }

    private JsonNode body(MockHttpServletRequestBuilder b) throws Exception {
        return json.readTree(mvc.perform(b).andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString());
    }

    private static MockMultipartHttpServletRequestBuilder upload(long courseId, String token, String fileName,
            byte[] data) {
        MockMultipartHttpServletRequestBuilder b = multipart("/api/past-exams/course/" + courseId);
        b.file(new MockMultipartFile("file", fileName, "application/octet-stream", data));
        b.param("kind", "FINAL").param("year", "2025").param("term", "FIRST")
                .param("doctor", "Dr. Example").param("withSolution", "true");
        b.header("Authorization", "Bearer " + token);
        return b;
    }

    @Test
    void timetableIsSavedPerStudent() throws Exception {
        String rami = signUpAndLogin("rami");
        String dana = signUpAndLogin("dana");

        JsonNode saved = body(auth(put("/api/timetable"), rami).content("""
                {"items":[
                  {"courseId":3,"title":"Circuits","day":0,"start":480,"end":570,"location":"E201","color":2},
                  {"title":"Lab","day":2,"start":600,"end":720,"location":"  ","color":0}]}"""));
        assertThat(saved.size()).isEqualTo(2);
        assertThat(saved.get(0).get("courseId").asLong()).isEqualTo(3);
        assertThat(saved.get(1).get("location").isNull()).isTrue();
        assertThat(body(auth(get("/api/timetable"), rami)).size()).isEqualTo(2);
        assertThat(body(auth(get("/api/timetable"), dana)).size()).isZero();

        // Ends before it starts, bad day, unknown course, signed out.
        mvc.perform(auth(put("/api/timetable"), rami).content(
                "{\"items\":[{\"title\":\"x\",\"day\":1,\"start\":600,\"end\":600,\"color\":0}]}"))
                .andExpect(status().isBadRequest());
        mvc.perform(auth(put("/api/timetable"), rami).content(
                "{\"items\":[{\"title\":\"x\",\"day\":7,\"start\":600,\"end\":660,\"color\":0}]}"))
                .andExpect(status().isBadRequest());
        mvc.perform(auth(put("/api/timetable"), rami).content(
                "{\"items\":[{\"courseId\":999999,\"title\":\"x\",\"day\":1,\"start\":600,\"end\":660,\"color\":0}]}"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/timetable")).andExpect(status().isUnauthorized());

        // Replacing with an empty list clears it.
        assertThat(body(auth(put("/api/timetable"), rami).content("{\"items\":[]}")).size()).isZero();
    }

    @Test
    void studentExamsWaitForAnAdmin() throws Exception {
        String yara = signUpAndLogin("yara");
        String karim = signUpAndLogin("karim");
        signUpAndLogin("boss");
        makeAdmin("boss");
        String boss = login("boss");

        // Only PDFs and images are accepted, and only from signed-in users.
        mvc.perform(upload(11, yara, "notes.html", "<script>alert(1)</script>".getBytes()))
                .andExpect(status().isBadRequest());
        MockMultipartHttpServletRequestBuilder anonymous = multipart("/api/past-exams/course/11");
        anonymous.file(new MockMultipartFile("file", "a.pdf", "application/pdf", PDF)).param("kind", "FINAL")
                .param("year", "2025").param("term", "FIRST");
        mvc.perform(anonymous).andExpect(status().isUnauthorized());

        JsonNode mine = json.readTree(mvc.perform(upload(11, yara, "../../Final 2025.PDF", PDF))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        long examId = mine.get("id").asLong();
        assertThat(mine.get("approved").asBoolean()).isFalse();
        assertThat(mine.get("fileName").asText()).isEqualTo("Final 2025.pdf");
        assertThat(mine.get("contentType").asText()).isEqualTo("application/pdf");

        // Hidden from everyone but the uploader (and admins) until approved.
        assertThat(body(get("/api/past-exams/course/11")).size()).isZero();
        assertThat(body(auth(get("/api/past-exams/course/11"), karim)).size()).isZero();
        assertThat(body(auth(get("/api/past-exams/course/11"), yara)).get(0).get("mine").asBoolean()).isTrue();
        mvc.perform(get("/api/past-exams/" + examId + "/file")).andExpect(status().isNotFound());
        mvc.perform(auth(get("/api/past-exams/" + examId + "/file"), yara)).andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"));

        // Only admins see the queue and approve.
        mvc.perform(auth(get("/api/admin/past-exams/pending"), yara)).andExpect(status().isForbidden());
        JsonNode queue = body(auth(get("/api/admin/past-exams/pending"), boss));
        assertThat(queue.size()).isEqualTo(1);
        assertThat(queue.get(0).get("uploader").asText()).isEqualTo("yara");
        body(auth(post("/api/admin/past-exams/" + examId + "/approve"), boss));
        assertThat(body(auth(get("/api/admin/past-exams/pending"), boss)).size()).isZero();
        assertThat(body(auth(get("/api/notifications"), yara)).get(0).get("type").asText())
                .isEqualTo("EXAM_APPROVED");

        // Now public, served inline with a sandbox so it can't run scripts on the API's origin.
        JsonNode listed = body(get("/api/past-exams/course/11"));
        assertThat(listed.get(0).get("doctor").asText()).isEqualTo("Dr. Example");
        assertThat(listed.get(0).get("withSolution").asBoolean()).isTrue();
        assertThat(listed.get(0).get("mine").asBoolean()).isFalse();
        byte[] served = mvc.perform(get("/api/past-exams/" + examId + "/file"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Security-Policy", org.hamcrest.Matchers.startsWith("sandbox")))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.startsWith("inline")))
                .andReturn().getResponse().getContentAsByteArray();
        assertThat(served).isEqualTo(PDF);
        mvc.perform(get("/api/past-exams/" + examId + "/file?download=true"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.startsWith("attachment")));

        // Someone else can't delete it; the uploader can.
        mvc.perform(auth(delete("/api/past-exams/" + examId), karim)).andExpect(status().isForbidden());
        mvc.perform(auth(delete("/api/past-exams/" + examId), yara)).andExpect(status().isNoContent());
        assertThat(body(get("/api/past-exams/course/11")).size()).isZero();

        // An admin's own upload is public at once.
        JsonNode adminExam = json.readTree(mvc.perform(upload(11, boss, "quiz.pdf", PDF))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        assertThat(adminExam.get("approved").asBoolean()).isTrue();
        assertThat(body(get("/api/past-exams/course/11")).size()).isEqualTo(1);

        // Rejecting deletes the upload and tells the student.
        long rejected = json.readTree(mvc.perform(upload(11, karim, "scan.pdf", PDF))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asLong();
        body(auth(post("/api/admin/past-exams/" + rejected + "/reject"), boss));
        assertThat(body(auth(get("/api/past-exams/course/11"), karim)).size()).isEqualTo(1);
        assertThat(body(auth(get("/api/notifications"), karim)).get(0).get("type").asText())
                .isEqualTo("EXAM_REJECTED");
    }

    @Test
    void examDatesArePrivateAndRemindTwice() throws Exception {
        String salma = signUpAndLogin("salma");
        String fadi = signUpAndLogin("fadi");
        Instant inTwoDays = Instant.now().plus(Duration.ofHours(50));

        JsonNode exam = json.readTree(mvc.perform(auth(post("/api/exam-dates"), salma).content(
                "{\"courseId\":12,\"title\":\"Signals final\",\"kind\":\"FINAL\",\"startsAt\":\"" + inTwoDays
                        + "\",\"location\":\"Hall 3\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        long id = exam.get("id").asLong();
        assertThat(body(auth(get("/api/exam-dates"), salma)).size()).isEqualTo(1);
        assertThat(body(auth(get("/api/exam-dates"), fadi)).size()).isZero();
        mvc.perform(auth(delete("/api/exam-dates/" + id), fadi)).andExpect(status().isNotFound());
        mvc.perform(auth(post("/api/exam-dates"), salma)
                .content("{\"title\":\"x\",\"kind\":\"PARTY\",\"startsAt\":\"" + inTwoDays + "\"}"))
                .andExpect(status().isBadRequest());

        // Two days away: the "3 days left" reminder goes out once, then "tomorrow" when it's a day away.
        Instant now = Instant.now();
        examDateService.sendDueReminders(now);
        examDateService.sendDueReminders(now);
        JsonNode notes = body(auth(get("/api/notifications"), salma));
        assertThat(notes.size()).isEqualTo(1);
        assertThat(notes.get(0).get("type").asText()).isEqualTo("EXAM_SOON");
        assertThat(notes.get(0).get("message").asText()).isEqualTo("Signals final");
        examDateService.sendDueReminders(now.plus(Duration.ofHours(30)));
        examDateService.sendDueReminders(now.plus(Duration.ofHours(31)));
        notes = body(auth(get("/api/notifications"), salma));
        assertThat(notes.size()).isEqualTo(2);
        assertThat(notes.get(0).get("type").asText()).isEqualTo("EXAM_TOMORROW");

        // Moving the exam resets its reminders; deleting it removes it.
        Instant later = Instant.now().plus(Duration.ofHours(20));
        body(auth(put("/api/exam-dates/" + id), salma).content(
                "{\"title\":\"Signals final\",\"kind\":\"FINAL\",\"startsAt\":\"" + later + "\"}"));
        examDateService.sendDueReminders(Instant.now());
        assertThat(body(auth(get("/api/notifications"), salma)).size()).isEqualTo(3);
        mvc.perform(auth(delete("/api/exam-dates/" + id), salma)).andExpect(status().isNoContent());
        assertThat(body(auth(get("/api/exam-dates"), salma)).size()).isZero();
    }
}
