package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.TechnicalSheetItem;
import br.com.sigrest.api.entity.UnitOfMeasure;

import java.math.BigDecimal;

public record TechnicalSheetItemResponseDTO(
        Long id,
        ProductResponseDTO rawMaterial,
        BigDecimal quantity,
        UnitOfMeasure unit
) {
    public TechnicalSheetItemResponseDTO(TechnicalSheetItem item) {
        this(item.getId(), new ProductResponseDTO(item.getRawMaterial()), item.getQuantity(), item.getUnit());
    }
}