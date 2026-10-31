package br.com.sigrest.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ProductionOrderRequestDTO(
        Long id,
        @NotNull(message = "selecione o produto final") Long finalProductId,
        @NotNull(message = "informe a quantidade") @Positive(message = "a quantidade deve ser maior que zero") BigDecimal quantity,
        String notes
) {}
