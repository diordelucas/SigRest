package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.CashMovement;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CashMovementRequestDTO {
    private Long cashRegisterId;
    private CashMovement.MovementType type;
    private BigDecimal amount;
    private String description;
    private Long userId;
}

