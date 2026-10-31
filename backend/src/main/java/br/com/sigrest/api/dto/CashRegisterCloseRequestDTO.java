package br.com.sigrest.api.dto;

import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

/** Fechamento do caixa. O valor contado é opcional e serve para apontar diferença com o saldo calculado. */
public record CashRegisterCloseRequestDTO(
        @DecimalMin(value = "0.0", message = "o valor contado não pode ser negativo") BigDecimal countedBalance
) {
}
