package com.engineeringmap.server.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CourseRequestDto(
    @NotBlank(message = "Name cannot be blank")
    String name,

    @NotBlank(message = "Label cannot be blank")
    String label,

    @NotBlank(message = "Description cannot be blank")
    String description,

    @NotNull(message = "Credit hours cannot be null")
    @Positive(message = "Credit hours must be positive")
    Integer creditHours
) {}