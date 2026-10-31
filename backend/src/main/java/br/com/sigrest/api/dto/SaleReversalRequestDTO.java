package br.com.sigrest.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaleReversalRequestDTO(
        @NotBlank(message = "informe o motivo do estorno")
        @Size(max = 255, message = "o motivo do estorno deve ter até 255 caracteres") String reason
) {
}
