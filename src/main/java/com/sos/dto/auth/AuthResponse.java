package com.sos.dto.auth;

public record AuthResponse(
        String accessToken,
        String tokenType
) {
}
