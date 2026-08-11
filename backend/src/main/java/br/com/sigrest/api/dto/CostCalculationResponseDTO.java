package br.com.sigrest.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record CostCalculationResponseDTO(
        Long technicalSheetId,
        String technicalSheetName,
        List<ItemCostDTO> itemCosts,
        BigDecimal ingredientsTotalCost,
        BigDecimal labourCostPercent,
        BigDecimal variableExpensesPercent,
        BigDecimal desiredMarginPercent,
        BigDecimal totalCostWithLabour,
        BigDecimal suggestedSellPrice,
        Integer rendimento,
        BigDecimal perServingCost
) {
    public record ItemCostDTO(
            Long itemId,
            String rawMaterialName,
            BigDecimal quantity,
            String unit,
            BigDecimal costPerBaseUnit,
            BigDecimal itemCost
    ) {}
}