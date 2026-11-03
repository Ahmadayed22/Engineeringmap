package com.engineeringmap.server.dto.response;

/** What anyone may see about another user. Deliberately excludes the email address. */
public record PublicUserResponse(Long id, String username) {
}
