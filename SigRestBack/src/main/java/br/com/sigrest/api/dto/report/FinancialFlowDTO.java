package br.com.sigrest.api.dto.report;

import java.math.BigDecimal;

public record FinancialFlowDTO(
        String month,
        BigDecimal totalEntradas,
        BigDecimal totalSaidas,
        BigDecimal saldo
) {
}