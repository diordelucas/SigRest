package br.com.sigrest.api.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception for business/domain rule violations (e.g. "a cash register is already open").
 *
 * <p>Carries the HTTP status that should be returned to the client, so the
 * {@link GlobalExceptionHandler} can translate it into a clear, user-facing response.
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    /** Convenience constructor defaulting to 400 Bad Request. */
    public BusinessException(String message) {
        this(message, HttpStatus.BAD_REQUEST);
    }

    public HttpStatus getStatus() {
        return status;
    }
}