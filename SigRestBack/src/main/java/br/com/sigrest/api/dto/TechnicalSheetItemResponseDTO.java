package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.TechnicalSheetItem;
import java.math.BigDecimal;

public record TechnicalSheetItemResponseDTO(Long id, ProductResponseDTO rawMaterial, BigDecimal quantity) {
    public TechnicalSheetItemResponseDTO(TechnicalSheetItem item) {
        this(item.getId(), new ProductResponseDTO(item.getRawMaterial()), item.getQuantity());
    }
}

