package br.com.sigrest.api.dto.report;

import br.com.sigrest.api.dto.CostCalculationResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Custo de uma ficha técnica comparado ao preço de venda praticado hoje no produto final.
 * {@code realMarginPercent} usa a mesma conta do markup divisor (100 - despesas variáveis -
 * custo/preço), então fica igual à margem desejada quando o preço atual é o preço sugerido.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalSheetCostReportDTO {
    private String finalProductName;
    private BigDecimal currentSellPrice;
    /** Null quando o produto final não tem preço de venda cadastrado. */
    private BigDecimal realMarginPercent;
    private CostCalculationResponseDTO cost;
}
