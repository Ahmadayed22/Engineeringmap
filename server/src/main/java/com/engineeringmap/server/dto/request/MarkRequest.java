package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.Size;

public record MarkRequest(
    @Size(min = 1, max = 2, message = "Mark must be exactly one or Two character ")
    String mark) {
    
}
