package br.com.sigrest.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record TechnicalSheetRequestDTO(
        Long id,
        String name,
        Long finalProductId,
        List<TechnicalSheetItemRequestDTO> items,
        Integer rendimento,
        BigDecimal labourCostPercent,
        BigDecimal variableExpensesPercent,
        BigDecimal desiredMarginPercent
) {}