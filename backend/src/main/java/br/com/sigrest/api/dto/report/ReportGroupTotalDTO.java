package br.com.sigrest.api.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Linha de resumo agrupado (ex.: total por forma de pagamento, por fornecedor, por motivo). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportGroupTotalDTO {
    private String label;
    private Long count;
    private BigDecimal total;
}
