package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.UnitOfMeasure;

import java.math.BigDecimal;

public record TechnicalSheetItemRequestDTO(
        Long id,
        Long rawMaterialId,
        BigDecimal quantity,
        UnitOfMeasure unit
) {}