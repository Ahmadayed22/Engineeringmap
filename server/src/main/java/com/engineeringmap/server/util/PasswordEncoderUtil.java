package com.engineeringmap.server.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderUtil {
    private static final BCryptPasswordEncoder  passwordEncoder = new BCryptPasswordEncoder();

    public static String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    public static boolean matches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
