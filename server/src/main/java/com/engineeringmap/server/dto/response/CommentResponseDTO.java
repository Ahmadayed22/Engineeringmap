package com.engineeringmap.server.dto.response;

import java.time.LocalDateTime;

public record CommentResponseDTO(
    Long id,
    String content,
    Long courseId,
    Long userId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}