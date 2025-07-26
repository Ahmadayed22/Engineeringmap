package com.engineeringmap.server.dto.response;

public record LoginResponse(UserInfo userInfo, String accessToken) {}