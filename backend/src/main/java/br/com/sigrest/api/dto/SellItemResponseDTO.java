package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.SellItem;
import java.math.BigDecimal;

public record SellItemResponseDTO(Long id, BigDecimal unitPrice, BigDecimal quantity, Long productId, String productName) {
    public SellItemResponseDTO(SellItem item){
        this(item.getId(), item.getUnitPrice(), item.getQuantity(), 
             item.getProduct() != null ? item.getProduct().getId() : null,
             item.getProduct() != null ? item.getProduct().getName() : null);
    }
}

