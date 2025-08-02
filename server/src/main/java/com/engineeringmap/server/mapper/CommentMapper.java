package com.engineeringmap.server.mapper;

import com.engineeringmap.server.dto.request.CommentRequestDTO;
import com.engineeringmap.server.dto.response.CommentResponseDTO;
import com.engineeringmap.server.entity.Comment;
import com.engineeringmap.server.entity.Course;
import com.engineeringmap.server.entity.User;

public class CommentMapper {
    public static Comment toEntity(CommentRequestDTO dto, Course course, User user) {
        return new Comment(dto.content(), course, user);
    }

    public static CommentResponseDTO toResponseDto(Comment comment) {
        return new CommentResponseDTO(
            comment.getId(),
            comment.getContent(),
            comment.getCourse().getId(),
            comment.getUser().getId(),
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
