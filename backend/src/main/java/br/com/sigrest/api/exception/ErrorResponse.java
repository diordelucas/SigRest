package br.com.sigrest.api.exception;

import java.time.LocalDateTime;

/**
 * Standard error payload returned to the frontend.
 *
 * <p>The {@code message} field is consumed by the frontend (e.g.
 * {@code err.response.data.message}) to show a friendly toast/alert.
 */
public record ErrorResponse(String message, int status, LocalDateTime timestamp) {
    public ErrorResponse(String message, int status) {
        this(message, status, LocalDateTime.now());
    }
}