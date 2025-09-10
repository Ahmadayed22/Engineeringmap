package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResourceRequestDto(
    @Size(max = 1000) String books,
    @Size(max = 1000) String summaries,
    @Size(max = 1000) String slides,
    @Size(max = 1000) String labs,
    @Size(max = 1000) String exams,
    @Size(max = 1000) String videos,
    @Size(max = 200) String name,
    @NotNull Long courseId
    
) {
} 