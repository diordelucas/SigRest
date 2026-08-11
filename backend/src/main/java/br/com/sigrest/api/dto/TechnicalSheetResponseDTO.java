package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.TechnicalSheet;

import java.math.BigDecimal;
import java.util.List;

public record TechnicalSheetResponseDTO(
        Long id,
        String name,
        ProductResponseDTO finalProduct,
        List<TechnicalSheetItemResponseDTO> items,
        Integer rendimento,
        BigDecimal labourCostPercent,
        BigDecimal variableExpensesPercent,
        BigDecimal desiredMarginPercent
) {
    public TechnicalSheetResponseDTO(TechnicalSheet sheet) {
        this(
                sheet.getId(),
                sheet.getName(),
                new ProductResponseDTO(sheet.getFinalProduct()),
                sheet.getItems() != null
                        ? sheet.getItems().stream().map(TechnicalSheetItemResponseDTO::new).toList()
                        : List.of(),
                sheet.getRendimento(),
                sheet.getLabourCostPercent(),
                sheet.getVariableExpensesPercent(),
                sheet.getDesiredMarginPercent()
        );
    }
}