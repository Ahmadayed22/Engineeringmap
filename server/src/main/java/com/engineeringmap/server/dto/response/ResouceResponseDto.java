package com.engineeringmap.server.dto.response;

public record ResouceResponseDto(
    Long id,
    String books,
    String summaries,
    String slides,
    String labs,
    String exams,
    String videos,
    Long courseId,
    Long userId,
    String name,
    /** Sum of up (+1) and down (-1) votes. */
    long score,
    /** The caller's own vote (-1, 0 or 1); 0 when signed out. */
    int myVote,
    /** False while it waits for an admin; only its author and admins ever get such a row. */
    boolean approved
) {
}
