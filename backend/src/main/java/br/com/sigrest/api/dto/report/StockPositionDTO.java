package br.com.sigrest.api.dto.report;

import br.com.sigrest.api.entity.ProductType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Posição atual de um produto no estoque. Quantidades em unidade base (g, ml ou un), como o
 * estoque é armazenado; {@code unitCost} é o custo por unidade base, derivado do preço da
 * embalagem de compra.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockPositionDTO {
    private String code;
    private String name;
    private String categoryName;
    private ProductType tipo;
    private String baseUnit;
    private BigDecimal storage;
    private BigDecimal minStorage;
    private boolean belowMinimum;
    private BigDecimal unitCost;
    private BigDecimal stockValue;
}
