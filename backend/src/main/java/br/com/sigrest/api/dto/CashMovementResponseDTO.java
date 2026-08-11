package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.CashMovement;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CashMovementResponseDTO {
    private Long id;
    private Long cashRegisterId;
    private LocalDateTime date;
    private CashMovement.MovementType type;
    private BigDecimal amount;
    private String description;
    private UserResponseDTO user;
}

