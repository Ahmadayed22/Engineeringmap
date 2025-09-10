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
    String name
       ) {
    
}