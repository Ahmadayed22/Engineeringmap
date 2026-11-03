package com.engineeringmap.server.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.engineeringmap.server.controller.CommentController;
import com.engineeringmap.server.controller.CourseController;
import com.engineeringmap.server.controller.DrEmailController;
import com.engineeringmap.server.controller.UserController;
import com.engineeringmap.server.dto.response.UserResponse;
import com.engineeringmap.server.security.jwt.JwtUtil;
import com.engineeringmap.server.service.CommentService;
import com.engineeringmap.server.service.CourseService;
import com.engineeringmap.server.service.DrEmailService;
import com.engineeringmap.server.service.UserService;

/**
 * Locks in who may call what. Before this test existed, a "/**" permitAll rule made every
 * endpoint public, including deleting courses and editing faculty emails.
 */
@WebMvcTest(controllers = {CourseController.class, DrEmailController.class, UserController.class, CommentController.class})
@Import({SecurityConfig.class, JwtUtil.class})
@TestPropertySource(properties = {
        "jwt.secret=dGVzdC1zZWNyZXQta2V5LXRoYXQtaXMtbG9uZy1lbm91Z2gtZm9yLWhzMjU2LXNpZ25pbmc=",
        "jwt.access.expiration=60000"
})
class SecurityRulesTest {

    @Autowired MockMvc mvc;

    @MockitoBean CourseService courseService;
    @MockitoBean DrEmailService drEmailService;
    @MockitoBean UserService userService;
    @MockitoBean CommentService commentService;
    @MockitoBean UserDetailsServiceImp userDetailsServiceImp;

    private static UserDetailsImpl principal(String role) {
        return new UserDetailsImpl(7L, "student", "x", List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }

    @Test
    void publicReadsWorkWithoutLogin() throws Exception {
        when(courseService.getAllCourses()).thenReturn(List.of());
        when(drEmailService.getDrEmails(anyInt(), anyInt(), any(), any(), anyString(), anyString()))
                .thenReturn(Page.empty());
        mvc.perform(get("/api/courses")).andExpect(status().isOk());
        mvc.perform(get("/api/dremails")).andExpect(status().isOk());
        mvc.perform(get("/api/comments/course/3")).andExpect(status().isOk());
    }

    @Test
    void anExpiredOrBrokenTokenDoesNotBreakPublicReads() throws Exception {
        when(courseService.getAllCourses()).thenReturn(List.of());
        mvc.perform(get("/api/courses").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isOk());
    }

    @Test
    void anonymousUsersCannotChangeData() throws Exception {
        mvc.perform(delete("/api/courses/1")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/dremails").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/comments").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":1,\"content\":\"hi\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/courses/user/completed")).andExpect(status().isUnauthorized());
    }

    @Test
    void regularUsersCannotManageTheCatalogue() throws Exception {
        mvc.perform(delete("/api/courses/1").with(user(principal("USER")))).andExpect(status().isForbidden());
        mvc.perform(delete("/api/dremails/1").with(user(principal("USER")))).andExpect(status().isForbidden());
    }

    @Test
    void adminsCanManageTheCatalogue() throws Exception {
        mvc.perform(delete("/api/courses/1").with(user(principal("ADMIN")))).andExpect(status().isOk());
    }

    @Test
    void publicUserLookupDoesNotExposeEmail() throws Exception {
        when(userService.getUserById(5L)).thenReturn(new UserResponse(5L, "sara", "sara@example.com"));
        mvc.perform(get("/api/users/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("sara"))
                .andExpect(jsonPath("$.email").doesNotExist());
    }

    @Test
    void marksMustBeRealGrades() throws Exception {
        mvc.perform(post("/api/courses/1/mark").with(user(principal("USER")))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"mark\":\"Z\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/courses/1/mark").with(user(principal("USER")))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"mark\":\"B+\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void blankCommentEditsAreRejected() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/comments/4")
                        .with(user(principal("USER")))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"   \"}"))
                .andExpect(status().isBadRequest());
    }
}
