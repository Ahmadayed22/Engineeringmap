package com.engineeringmap.server.exception;

/** The request is valid but clashes with the current state (answered with 409). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
