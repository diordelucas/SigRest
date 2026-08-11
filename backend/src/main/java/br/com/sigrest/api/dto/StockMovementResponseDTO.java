package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.StockMovement;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StockMovementResponseDTO {
    private Long id;
    private ProductResponseDTO product;
    private StockMovement.MovementType type;
    private BigDecimal quantity;
    private LocalDateTime date;
    private String description;
}

