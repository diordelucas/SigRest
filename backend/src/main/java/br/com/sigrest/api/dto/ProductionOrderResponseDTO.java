package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.ProductionOrder;
import java.time.LocalDateTime;

public record ProductionOrderResponseDTO(
    Long id, 
    ProductResponseDTO finalProduct, 
    Integer quantity, 
    LocalDateTime date, 
    String status, 
    String notes
) {
    public ProductionOrderResponseDTO(ProductionOrder order) {
        this(
            order.getId(), 
            order.getFinalProduct() != null ? new ProductResponseDTO(order.getFinalProduct()) : null, 
            order.getQuantity(), 
            order.getDate(), 
            order.getStatus() != null ? order.getStatus().name() : null, 
            order.getNotes()
        );
    }
}

