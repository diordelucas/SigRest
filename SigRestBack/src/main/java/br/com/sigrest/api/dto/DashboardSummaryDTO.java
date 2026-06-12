package br.com.sigrest.api.dto;

import java.math.BigDecimal;

public record DashboardSummaryDTO(
        BigDecimal todayRevenue,
        long todaySalesCount,
        BigDecimal monthRevenue,
        long lowStockCount,
        BigDecimal totalReceivable,
        BigDecimal totalPayable,
        BigDecimal balanceForecast
) {
}