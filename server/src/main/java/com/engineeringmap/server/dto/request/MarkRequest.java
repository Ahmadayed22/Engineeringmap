package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MarkRequest(
    @NotBlank(message = "Mark is required")
    @Pattern(regexp = "^(A|A-|B[+]|B|B-|C[+]|C|C-|D[+]|D|D-|F)$", message = "Mark must be a valid grade (A to F)")
    String mark) {
}
