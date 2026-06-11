package br.com.sigrest.api.dto.report;

import br.com.sigrest.api.entity.StockMovement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementReportDTO {
    private Long movementId;
    private LocalDateTime date;
    private String productName;
    private StockMovement.MovementType type;
    private Integer quantity;
    private String description;
}

