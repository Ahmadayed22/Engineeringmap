package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCommentRequest(

    // @NotNull(message = "User ID cannot be null")
    // Long userId,

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 4000, message = "Content cannot exceed 4000 characters")
    String content
) {}
