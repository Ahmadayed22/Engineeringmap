package com.engineeringmap.server.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.engineeringmap.server.dto.StudyToolsDto.ExamDateRequest;
import com.engineeringmap.server.dto.StudyToolsDto.ExamDateResponse;
import com.engineeringmap.server.dto.StudyToolsDto.PastExamResponse;
import com.engineeringmap.server.dto.StudyToolsDto.PastExamUpload;
import com.engineeringmap.server.dto.StudyToolsDto.PendingExam;
import com.engineeringmap.server.dto.StudyToolsDto.PendingMaterial;
import com.engineeringmap.server.dto.StudyToolsDto.TimetableItem;
import com.engineeringmap.server.dto.StudyToolsDto.TimetableRequest;
import com.engineeringmap.server.dto.response.SuccessResponse;
import com.engineeringmap.server.security.UserDetailsImpl;
import com.engineeringmap.server.service.ExamDateService;
import com.engineeringmap.server.service.PastExamService;
import com.engineeringmap.server.service.ResourceService;
import com.engineeringmap.server.service.TimetableService;

import jakarta.validation.Valid;

/**
 * The weekly timetable, the student's exam dates, the past exam bank and the admin review of
 * new uploads. Access rules are in SecurityConfig (/api/admin/** is admin-only).
 */
@RestController
@RequestMapping("/api")
@Validated
public class StudyToolsController {

    private final TimetableService timetableService;
    private final ExamDateService examDateService;
    private final PastExamService pastExamService;
    private final ResourceService resourceService;

    public StudyToolsController(TimetableService timetableService, ExamDateService examDateService,
            PastExamService pastExamService, ResourceService resourceService) {
        this.timetableService = timetableService;
        this.examDateService = examDateService;
        this.pastExamService = pastExamService;
        this.resourceService = resourceService;
    }

    private static Long idOf(UserDetailsImpl user) {
        return user == null ? null : user.getId();
    }

    // ----- Weekly timetable -----
    @GetMapping("/timetable")
    public List<TimetableItem> timetable(@AuthenticationPrincipal UserDetailsImpl user) {
        return timetableService.get(user.getId());
    }

    @PutMapping("/timetable")
    public List<TimetableItem> saveTimetable(@Valid @RequestBody TimetableRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return timetableService.replace(user.getId(), request.items());
    }

    // ----- Exam dates (countdown) -----
    @GetMapping("/exam-dates")
    public List<ExamDateResponse> examDates(@AuthenticationPrincipal UserDetailsImpl user) {
        return examDateService.list(user.getId());
    }

    @PostMapping("/exam-dates")
    @ResponseStatus(HttpStatus.CREATED)
    public ExamDateResponse addExamDate(@Valid @RequestBody ExamDateRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return examDateService.create(user.getId(), request);
    }

    @PutMapping("/exam-dates/{id}")
    public ExamDateResponse updateExamDate(@PathVariable Long id, @Valid @RequestBody ExamDateRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return examDateService.update(id, user.getId(), request);
    }

    @DeleteMapping("/exam-dates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExamDate(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        examDateService.delete(id, user.getId());
    }

    // ----- Past exam bank -----
    @GetMapping("/past-exams/course/{courseId}")
    public List<PastExamResponse> pastExams(@PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return pastExamService.list(courseId, idOf(user));
    }

    @PostMapping(path = "/past-exams/course/{courseId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PastExamResponse uploadPastExam(@PathVariable Long courseId, @Valid @ModelAttribute PastExamUpload meta,
            @RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetailsImpl user)
            throws IOException {
        return pastExamService.upload(courseId, user.getId(), StudyPlanController.isAdmin(user), meta,
                file.getOriginalFilename(), file.getBytes());
    }

    /**
     * The exam file. Public for approved exams (a link opens it in a new tab); a waiting one is
     * only sent to its uploader and admins. {@code download=true} saves it instead of showing it.
     */
    @GetMapping("/past-exams/{id}/file")
    public ResponseEntity<byte[]> pastExamFile(@PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean download, @AuthenticationPrincipal UserDetailsImpl user) {
        PastExamService.ExamFile file = pastExamService.file(id, idOf(user), StudyPlanController.isAdmin(user));
        ContentDisposition disposition = (download ? ContentDisposition.attachment() : ContentDisposition.inline())
                .filename(file.fileName(), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                // Shown from the API's own origin, so never let a file run scripts there.
                .header("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'")
                .cacheControl(file.approved() ? CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic()
                        : CacheControl.noStore())
                .body(file.data());
    }

    @DeleteMapping("/past-exams/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePastExam(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        pastExamService.delete(id, user.getId(), StudyPlanController.isAdmin(user));
    }

    // ----- Admin review queue -----
    @GetMapping("/admin/past-exams/pending")
    public List<PendingExam> pendingExams() {
        return pastExamService.pending();
    }

    @PostMapping("/admin/past-exams/{id}/approve")
    public SuccessResponse approveExam(@PathVariable Long id) {
        pastExamService.approve(id);
        return new SuccessResponse("Approved");
    }

    @PostMapping("/admin/past-exams/{id}/reject")
    public SuccessResponse rejectExam(@PathVariable Long id) {
        pastExamService.reject(id);
        return new SuccessResponse("Rejected");
    }

    @GetMapping("/admin/materials/pending")
    public List<PendingMaterial> pendingMaterials() {
        return resourceService.pending();
    }

    @PostMapping("/admin/materials/{id}/approve")
    public SuccessResponse approveMaterial(@PathVariable Long id) {
        resourceService.approve(id);
        return new SuccessResponse("Approved");
    }

    @PostMapping("/admin/materials/{id}/reject")
    public SuccessResponse rejectMaterial(@PathVariable Long id) {
        resourceService.reject(id);
        return new SuccessResponse("Rejected");
    }
}
