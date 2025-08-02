package com.engineeringmap.server.dto.response;

import java.time.LocalDateTime;

public record CourseResponseDto(
    Long id,
    String name,
    String label,
    String description,
    Integer creditHours,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}