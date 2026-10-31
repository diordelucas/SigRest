package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.LossReason;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Corpo opcional de POST /production-order/{id}/finish. Sem corpo (ou actualQuantity nulo),
 * assume que a produção rendeu exatamente o planejado — comportamento anterior a este DTO.
 */
public record ProductionOrderFinishRequestDTO(
        @PositiveOrZero(message = "a quantidade real não pode ser negativa") BigDecimal actualQuantity,
        LossReason lossReason
) {}
