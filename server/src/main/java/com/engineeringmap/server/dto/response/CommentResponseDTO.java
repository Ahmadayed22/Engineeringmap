package com.engineeringmap.server.dto.response;

import java.time.LocalDateTime;

public record CommentResponseDTO(
    Long id,
    String content,
    Long courseId,
    Long userId,
    String username,
    /** Null for top-level comments; otherwise the comment this replies to. */
    Long parentId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
