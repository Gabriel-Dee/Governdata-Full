package com.governdata.ehr_emr_be.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, String identifier) {
        super(resourceName + " not found: " + identifier);
    }

    public ResourceNotFoundException(String resourceName, UUID id) {
        this(resourceName, id != null ? id.toString() : "null");
    }
}
