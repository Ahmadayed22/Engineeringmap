package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Links must be plain http(s) URLs. Anything else (javascript:, data:, ...) would run in
 * other students' browsers when they click the link.
 */
public record ResourceRequestDto(
    @Size(max = 1000) @Pattern(regexp = ResourceRequestDto.URL, message = ResourceRequestDto.URL_MSG) String books,
    @Size(max = 1000) @Pattern(regexp = ResourceRequestDto.URL, message = ResourceRequestDto.URL_MSG) String summaries,
    @Size(max = 1000) @Pattern(regexp = ResourceRequestDto.URL, message = ResourceRequestDto.URL_MSG) String slides,
    @Size(max = 1000) @Pattern(regexp = ResourceRequestDto.URL, message = ResourceRequestDto.URL_MSG) String labs,
    @Size(max = 1000) @Pattern(regexp = ResourceRequestDto.URL, message = ResourceRequestDto.URL_MSG) String exams,
    @Size(max = 1000) @Pattern(regexp = ResourceRequestDto.URL, message = ResourceRequestDto.URL_MSG) String videos,
    @Size(max = 200) String name,
    @NotNull Long courseId
) {
    /** Case-insensitive http:// or https:// followed by non-space characters. */
    public static final String URL = "^(?i)https?://[^ ]+$";
    public static final String URL_MSG = "must be a link starting with http:// or https://";
}
