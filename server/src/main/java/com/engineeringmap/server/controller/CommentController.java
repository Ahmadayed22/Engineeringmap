package com.engineeringmap.server.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.engineeringmap.server.dto.request.CommentRequestDTO;
import com.engineeringmap.server.dto.request.UpdateCommentRequest;
import com.engineeringmap.server.dto.response.CommentResponseDTO;
import com.engineeringmap.server.dto.response.ErrorResponse;
import com.engineeringmap.server.dto.response.SuccessResponse;
import com.engineeringmap.server.entity.Comment;
import com.engineeringmap.server.service.CommentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByCourse(@PathVariable Long courseId) {
        List<CommentResponseDTO> comments = commentService.getCommentsByCourseId(courseId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/course/name/{courseName}")
    public ResponseEntity<?> getCommentsByCourseName(@PathVariable String courseName) {
        try {
            List<CommentResponseDTO> comments = commentService.getCommentsByCourseName(courseName);
            return ResponseEntity.ok(comments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentResponseDTO> getCommentById(@PathVariable Long id) {
        Optional<CommentResponseDTO> comment = commentService.getCommentById(id);
        return comment.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createComment(@Valid @RequestBody CommentRequestDTO request) {
        try {
            CommentResponseDTO comment = commentService.createComment(
                    request.courseId(),
                    request.userId(),
                    request.content());
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    //Still have isue
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(
            @Valid
            @PathVariable Long id,
            @RequestBody UpdateCommentRequest request) {
        try {
            CommentResponseDTO updatedComment = commentService.updateComment(id, request.userId(), request.content());
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            commentService.deleteComment(id, userId);
            return ResponseEntity.ok(new SuccessResponse("Comment deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByUser(@PathVariable Long userId) {
        List<CommentResponseDTO> comments = commentService.getCommentsByUserId(userId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/course/{courseId}/count")
    public ResponseEntity<Long> getCommentCount(@PathVariable Long courseId) {
        long count = commentService.getCommentCountByCourseId(courseId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<CommentResponseDTO>> getUserCommentsForCourse(
            @PathVariable Long userId, 
            @PathVariable Long courseId) {
        List<CommentResponseDTO> comments = commentService.getUserCommentsForCourse(userId, courseId);
        return ResponseEntity.ok(comments);
    }
}
