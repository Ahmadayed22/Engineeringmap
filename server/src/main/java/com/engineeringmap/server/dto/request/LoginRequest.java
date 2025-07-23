package com.engineeringmap.server.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record LoginRequest(
        @NotBlank String password,
        @NotBlank @Email String email) {
} 
