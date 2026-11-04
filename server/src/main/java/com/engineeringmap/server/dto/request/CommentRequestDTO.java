package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CommentRequestDTO(
    @NotNull(message = "Course ID cannot be null")
    Long courseId,
    @NotBlank(message = "Content cannot be blank")
    @Size(max = 4000, message = "Content cannot exceed 4000 characters")
    String content,
    /** Optional: the comment being replied to (threads are one level deep). */
    Long parentId
) {
    /** Kept for callers that create top-level comments. */
    public CommentRequestDTO(Long courseId, String content) {
        this(courseId, content, null);
    }
}
