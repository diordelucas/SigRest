package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.report.MonthlyRevenueDTO;
import br.com.sigrest.api.dto.report.ProductSalesDTO;
import br.com.sigrest.api.dto.report.SalesByPeriodDTO;
import br.com.sigrest.api.dto.report.StockMovementReportDTO;
import br.com.sigrest.api.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sales-by-period")
    public ResponseEntity<List<SalesByPeriodDTO>> getSalesByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SalesByPeriodDTO> sales = reportService.getSalesByPeriod(startDate, endDate);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/top-selling-products")
    public ResponseEntity<List<ProductSalesDTO>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        List<ProductSalesDTO> topProducts = reportService.getTopSellingProducts(limit);
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startMonth,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endMonth) {
        List<MonthlyRevenueDTO> monthlyRevenue = reportService.getMonthlyRevenue(startMonth, endMonth);
        return ResponseEntity.ok(monthlyRevenue);
    }

    @GetMapping("/stock-movement")
    public ResponseEntity<List<StockMovementReportDTO>> getStockMovementReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<StockMovementReportDTO> stockMovements = reportService.getStockMovementReport(startDate, endDate);
        return ResponseEntity.ok(stockMovements);
    }

    // TODO: Implement financial flow report
    // @GetMapping("/financial-flow")
    // public ResponseEntity<FinancialFlowDTO> getFinancialFlow(...) {
    //     FinancialFlowDTO financialFlow = reportService.getFinancialFlow(...);
    //     return ResponseEntity.ok(financialFlow);
    // }
}
