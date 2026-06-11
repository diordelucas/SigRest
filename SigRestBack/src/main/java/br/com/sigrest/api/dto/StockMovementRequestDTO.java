package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.StockMovement;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockMovementRequestDTO {
    private Long productId;
    private StockMovement.MovementType type;
    private Integer quantity;
    private LocalDateTime date;
    private String description;
}

