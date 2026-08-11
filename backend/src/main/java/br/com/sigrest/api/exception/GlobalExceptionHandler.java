package br.com.sigrest.api.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralizes translation of domain exceptions into clean HTTP responses.
 *
 * <p>Intentionally scoped to {@link BusinessException} only, so Spring's default
 * handling of framework exceptions (malformed body -> 400, etc.) is preserved.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        ErrorResponse body = new ErrorResponse(ex.getMessage(), ex.getStatus().value());
        return ResponseEntity.status(ex.getStatus().value()).body(body);
    }
}