package com.engineeringmap.server.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Roadmaps (study plans) as the API sends and receives them. */
public final class StudyPlanDto {

    private StudyPlanDto() {
    }

    /** Shape of a roadmap id in URLs; whether it exists is checked by StudyPlanService. */
    public static final String SLUG_PATTERN = "^[a-z0-9][a-z0-9-]{0,39}$";

    /** imageVersion: null when no picture was uploaded (the client then uses its own, if any). */
    public record PlanInfo(String slug, String nameAr, String nameEn, boolean visible, int sortOrder,
            Long imageVersion) {
    }

    /** copyFrom: slug of the roadmap whose current map to copy; null = start with an empty map. */
    public record CreateRequest(
            @NotBlank @Size(max = 150) String nameAr,
            @NotBlank @Size(max = 150) String nameEn,
            @Pattern(regexp = SLUG_PATTERN) String copyFrom) {
    }

    /** Any field left null keeps its current value. */
    public record UpdateRequest(
            @Size(min = 1, max = 150) String nameAr,
            @Size(min = 1, max = 150) String nameEn,
            Boolean visible,
            @Min(0) @Max(10_000) Integer sortOrder) {
    }
}
