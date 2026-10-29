package br.com.sigrest.api.controller;

import br.com.sigrest.api.service.report.ReportPdfService;
import br.com.sigrest.api.service.report.ReportPdfService.PdfReport;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Relatórios gerenciais em PDF (templates Thymeleaf em {@code templates/reports/}). Restritos ao
 * ADMIN, como a tela de relatórios no frontend.
 */
@RestController
@RequestMapping("/reports/pdf")
@PreAuthorize("hasRole('ADMIN')")
public class ReportPdfController {

    private final ReportPdfService reportPdfService;

    public ReportPdfController(ReportPdfService reportPdfService) {
        this.reportPdfService = reportPdfService;
    }

    @GetMapping("/sales")
    public ResponseEntity<byte[]> sales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.sales(startDate, endDate));
    }

    @GetMapping("/top-selling-products")
    public ResponseEntity<byte[]> topSellingProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "20") int limit) {
        return pdf(reportPdfService.topSellingProducts(startDate, endDate, limit));
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<byte[]> monthlyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.monthlyRevenue(startDate, endDate));
    }

    @GetMapping("/financial-flow")
    public ResponseEntity<byte[]> financialFlow(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.financialFlow(startDate, endDate));
    }

    @GetMapping("/accounts-payable")
    public ResponseEntity<byte[]> accountsPayable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.accountsPayable(startDate, endDate));
    }

    @GetMapping("/accounts-receivable")
    public ResponseEntity<byte[]> accountsReceivable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.accountsReceivable(startDate, endDate));
    }

    @GetMapping("/purchases")
    public ResponseEntity<byte[]> purchases(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.purchases(startDate, endDate));
    }

    @GetMapping("/stock-position")
    public ResponseEntity<byte[]> stockPosition(@RequestParam(defaultValue = "false") boolean onlyBelowMinimum) {
        return pdf(reportPdfService.stockPosition(onlyBelowMinimum));
    }

    @GetMapping("/stock-movement")
    public ResponseEntity<byte[]> stockMovement(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.stockMovement(startDate, endDate));
    }

    @GetMapping("/loss")
    public ResponseEntity<byte[]> loss(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.loss(startDate, endDate));
    }

    @GetMapping("/technical-sheets")
    public ResponseEntity<byte[]> technicalSheets() {
        return pdf(reportPdfService.technicalSheets());
    }

    @GetMapping("/activity-log")
    public ResponseEntity<byte[]> activityLog(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return pdf(reportPdfService.activityLog(startDate, endDate));
    }

    /** "inline": o navegador abre o PDF numa aba em vez de baixar direto; o nome vale ao salvar. */
    private ResponseEntity<byte[]> pdf(PdfReport report) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(report.fileName()).build().toString())
                .body(report.content());
    }
}
