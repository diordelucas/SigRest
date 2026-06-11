package br.com.sigrest.api.dto;

import java.math.BigDecimal;

public record TechnicalSheetItemRequestDTO(Long id, Long rawMaterialId, BigDecimal quantity) {}
