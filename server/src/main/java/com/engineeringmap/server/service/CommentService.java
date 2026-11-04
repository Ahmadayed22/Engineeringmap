package com.engineeringmap.server.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.engineeringmap.server.dto.response.CommentResponseDTO;
import com.engineeringmap.server.entity.Comment;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.RoleType;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.mapper.CommentMapper;
import com.engineeringmap.server.repo.CommentRepo;
import com.engineeringmap.server.repo.CourseRepo;
import com.engineeringmap.server.repo.UserRepo;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CommentService {
    private final CommentRepo commentRepository;
    private final CourseRepo courseRepository;
    private final UserRepo userRepository;
    private final NotificationService notificationService;

    public CommentService(CommentRepo commentRepository, CourseRepo courseRepository, UserRepo userRepository,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<CommentResponseDTO> getCommentsByCourseId(Long courseId) {
        List<Comment> comments = commentRepository.findByCourseIdWithUser(courseId);
        return comments.stream()
                .map(CommentMapper::toResponseDto)
                .toList();
    }
    
    public List<CommentResponseDTO> getCommentsByCourseName(@NotBlank String courseName) {
        Course course = courseRepository.findByNameIgnoreCase(courseName)
                .orElseThrow(() -> new RuntimeException("Course not found with name: " + courseName));
        List<Comment> comments = commentRepository.findByCourseIdWithUserOrderByCreatedAtAsc(course.getId());
        return comments.stream()
                      .map(CommentMapper::toResponseDto)
                      .toList();
    }

    public Optional<CommentResponseDTO> getCommentById(Long id) {
        return commentRepository.findById(id)
                               .map(CommentMapper::toResponseDto);
    }

    public CommentResponseDTO createComment(Long courseId, Long userId, String content) {
        return createComment(courseId, userId, content, null);
    }

    /** Creates a comment, or a reply when {@code parentId} is set (and notifies the parent's author). */
    public CommentResponseDTO createComment(Long courseId, Long userId, String content, Long parentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Comment parent = null;
        if (parentId != null) {
            parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("The comment you replied to no longer exists"));
            if (!parent.getCourse().getId().equals(courseId)) {
                throw new IllegalArgumentException("Reply must be on the same course");
            }
            // Keep threads one level deep: replying to a reply attaches to its thread.
            if (parent.getParentId() != null) {
                parent = commentRepository.findById(parent.getParentId()).orElse(parent);
            }
        }

        Comment comment = new Comment(content.trim(), course, user);
        if (parent != null) {
            comment.setParentId(parent.getId());
        }
        Comment savedComment = commentRepository.save(comment);

        if (parent != null && !parent.getUser().getId().equals(userId)) {
            notificationService.notifyReply(parent.getUser(), user.getUsername(), courseId, savedComment.getId());
        }
        return CommentMapper.toResponseDto(savedComment);
    }

    public CommentResponseDTO updateComment(Long commentId, Long userId, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own comments");
        }

        comment.setContent(newContent);
        Comment updatedComment = commentRepository.save(comment);
        return CommentMapper.toResponseDto(updatedComment);
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
             boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleType.ADMIN);

        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        // Deleting a top-level comment removes its replies too.
        List<Comment> replies = comment.getParentId() == null
                ? commentRepository.findByParentId(comment.getId())
                : List.of();
        List<Long> ids = new java.util.ArrayList<>(replies.stream().map(Comment::getId).toList());
        ids.add(comment.getId());
        notificationService.deleteForComments(ids);
        commentRepository.deleteAll(replies);
        commentRepository.delete(comment);
    }

    public List<CommentResponseDTO> getCommentsByUserId(Long userId) {
        List<Comment> comments = commentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return comments.stream()
                      .map(CommentMapper::toResponseDto)
                      .toList();
    }

    public long getCommentCountByCourseId(Long courseId) {
        return commentRepository.countByCourseId(courseId);
    }

    public List<CommentResponseDTO> getUserCommentsForCourse(Long userId, Long courseId) {
        List<Comment> comments = commentRepository.findByUserIdAndCourseIdOrderByCreatedAtDesc(userId, courseId);
        return comments.stream()
                      .map(CommentMapper::toResponseDto)
                      .toList();
    }
}
