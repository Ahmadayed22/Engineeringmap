package com.engineeringmap.server.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * The study-plan map as the API and the database store it. Only these fields are kept, so the
 * stored JSON can't carry arbitrary styles or scripts; the client turns them into map nodes.
 */
public final class StudyMapDto {

    private StudyMapDto() {
    }

    public static final String COLOR_PATTERN = "^#[0-9a-fA-F]{6}$";

    /**
     * A box on the map. The root banner has no course; every other node points to a course.
     * The same course may appear more than once (see client/src/features/progress/prerequisites.ts).
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MapNode(
            @NotBlank @Size(max = 100) String id,
            Long courseId,
            @NotBlank @Size(max = 300) String label,
            double x,
            double y,
            @NotNull @Pattern(regexp = COLOR_PATTERN) String color,
            Boolean root) {

        /** True for the title banner (not a JSON property: no get/is prefix). */
        public boolean banner() {
            return Boolean.TRUE.equals(root);
        }
    }

    /** "source is required before target"; coreq = may be taken in the same semester (dashed). */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MapEdge(
            @NotBlank @Size(max = 210) String id,
            @NotBlank String source,
            @NotBlank String target,
            @NotNull @Pattern(regexp = COLOR_PATTERN) String color,
            Boolean coreq) {
    }

    public record MapContent(
            @NotNull @Size(min = 1, max = 500) List<@Valid @NotNull MapNode> nodes,
            @NotNull @Size(max = 2000) List<@Valid @NotNull MapEdge> edges) {
    }

    public record MapResponse(String plan, int version, LocalDateTime updatedAt, String updatedBy,
            MapContent content) {
    }

    /** baseVersion = the version the editor started from; publishing fails if it is no longer current. */
    public record PublishRequest(@NotNull Integer baseVersion, @NotNull @Valid MapContent content) {
    }

    public record VersionInfo(int version, LocalDateTime createdAt, String author) {
    }
}
