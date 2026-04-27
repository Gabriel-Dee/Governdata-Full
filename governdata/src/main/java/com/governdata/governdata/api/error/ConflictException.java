package com.governdata.governdata.api.error;

/** Thrown when a unique resource already exists (e.g. email taken). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
