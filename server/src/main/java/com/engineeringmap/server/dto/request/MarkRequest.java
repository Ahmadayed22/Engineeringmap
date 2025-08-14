package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.Size;

public record MarkRequest(
    @Size(min = 1, max = 1, message = "Mark must be exactly one character long")
    String mark) {
    
}
