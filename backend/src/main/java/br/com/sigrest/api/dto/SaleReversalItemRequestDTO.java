package br.com.sigrest.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SaleReversalItemRequestDTO(
        @NotNull(message = "informe o item a estornar") Long sellItemId,
        @NotNull(message = "informe a quantidade a estornar")
        @DecimalMin(value = "0.001", message = "a quantidade a estornar deve ser maior que zero") BigDecimal quantity
) {
}
