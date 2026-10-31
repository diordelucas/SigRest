package br.com.sigrest.api.service.report;

import br.com.sigrest.api.dto.report.AccountReportRowDTO;
import br.com.sigrest.api.dto.report.FinancialFlowDTO;
import br.com.sigrest.api.dto.report.LossReportDTO;
import br.com.sigrest.api.dto.report.MonthlyRevenueDTO;
import br.com.sigrest.api.dto.report.ProductSalesDTO;
import br.com.sigrest.api.dto.report.PurchaseHistoryDTO;
import br.com.sigrest.api.dto.report.ReportGroupTotalDTO;
import br.com.sigrest.api.dto.report.SaleReportRowDTO;
import br.com.sigrest.api.dto.report.StockMovementReportDTO;
import br.com.sigrest.api.dto.report.StockPositionDTO;
import br.com.sigrest.api.dto.report.TechnicalSheetCostReportDTO;
import br.com.sigrest.api.entity.ActivityLog;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.service.ReportService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Monta os dados de cada relatório gerencial (consultas do {@link ReportService} + totais e
 * agrupamentos) e entrega para o {@link PdfReportRenderer} transformar em PDF.
 */
@Service
public class ReportPdfService {

    /** Conteúdo do PDF e o nome sugerido para o arquivo. */
    public record PdfReport(String fileName, byte[] content) {
    }

    private final ReportService reportService;
    private final PdfReportRenderer renderer;
    private final ReportFormatter fmt = new ReportFormatter();

    public ReportPdfService(ReportService reportService, PdfReportRenderer renderer) {
        this.reportService = reportService;
        this.renderer = renderer;
    }

    // ================================ Vendas ================================

    public PdfReport sales(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<SaleReportRowDTO> vendas = reportService.getSalesDetail(startDate, endDate);

        BigDecimal faturamento = soma(vendas, SaleReportRowDTO::getTotal);
        BigDecimal descontos = soma(vendas, SaleReportRowDTO::getDiscount);

        Map<String, Object> dados = new HashMap<>();
        dados.put("vendas", vendas);
        dados.put("porDia", reportService.getSalesByPeriod(startDate, endDate));
        dados.put("porFormaPagamento", agrupar(vendas, v -> fmt.formaPagamento(v.getPaymentMethod()), SaleReportRowDTO::getTotal));
        dados.put("quantidadeVendas", vendas.size());
        dados.put("faturamento", faturamento);
        dados.put("descontos", descontos);
        dados.put("ticketMedio", media(faturamento, vendas.size()));
        return gerar("vendas", "Relatório de Vendas", startDate, endDate, dados);
    }

    public PdfReport topSellingProducts(LocalDate startDate, LocalDate endDate, int limit) {
        validarPeriodo(startDate, endDate);
        List<ProductSalesDTO> produtos = reportService.getTopSellingProducts(startDate, endDate, Math.max(1, Math.min(limit, 50)));

        Map<String, Object> dados = new HashMap<>();
        dados.put("produtos", produtos);
        dados.put("maiorQuantidade", produtos.stream().map(ProductSalesDTO::getTotalQuantitySold).max(Long::compare).orElse(0L));
        dados.put("receitaTotal", soma(produtos, ProductSalesDTO::getTotalRevenue));
        dados.put("quantidadeTotal", produtos.stream().mapToLong(ProductSalesDTO::getTotalQuantitySold).sum());
        return gerar("produtos-mais-vendidos", "Produtos Mais Vendidos", startDate, endDate, dados);
    }

    public PdfReport monthlyRevenue(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        Map<YearMonth, BigDecimal> porMes = reportService.getMonthlyRevenue(startDate, endDate).stream()
                .collect(Collectors.toMap(MonthlyRevenueDTO::getMonth, MonthlyRevenueDTO::getTotalRevenue));

        // Meses sem venda também aparecem (com zero), para o gráfico não "pular" meses.
        List<MonthlyRevenueDTO> meses = new ArrayList<>();
        for (YearMonth m = YearMonth.from(startDate); !m.isAfter(YearMonth.from(endDate)); m = m.plusMonths(1)) {
            meses.add(new MonthlyRevenueDTO(m, porMes.getOrDefault(m, BigDecimal.ZERO)));
        }
        BigDecimal total = soma(meses, MonthlyRevenueDTO::getTotalRevenue);

        Map<String, Object> dados = new HashMap<>();
        dados.put("meses", meses);
        dados.put("total", total);
        dados.put("mediaMensal", media(total, meses.size()));
        dados.put("maiorValor", maximo(meses, MonthlyRevenueDTO::getTotalRevenue));
        dados.put("melhorMes", meses.stream()
                .filter(m -> m.getTotalRevenue().signum() > 0)
                .max(Comparator.comparing(MonthlyRevenueDTO::getTotalRevenue))
                .orElse(null));
        return gerar("faturamento-mensal", "Faturamento Mensal", startDate, endDate, dados);
    }

    // ============================== Financeiro ==============================

    public PdfReport financialFlow(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<FinancialFlowDTO> meses = reportService.getFinancialFlow(startDate, endDate);
        BigDecimal entradas = soma(meses, FinancialFlowDTO::totalEntradas);
        BigDecimal saidas = soma(meses, FinancialFlowDTO::totalSaidas);

        Map<String, Object> dados = new HashMap<>();
        dados.put("meses", meses);
        dados.put("entradas", entradas);
        dados.put("saidas", saidas);
        dados.put("saldo", entradas.subtract(saidas));
        dados.put("maiorValor", maximo(meses, FinancialFlowDTO::totalEntradas).max(maximo(meses, FinancialFlowDTO::totalSaidas)));
        return gerar("fluxo-financeiro", "Fluxo Financeiro", startDate, endDate, dados);
    }

    public PdfReport accountsPayable(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        return contas(reportService.getAccountsPayable(startDate, endDate), "contas-a-pagar", "Contas a Pagar",
                "Fornecedor", "Pagamento", "PAID", "Pago", startDate, endDate);
    }

    public PdfReport accountsReceivable(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        return contas(reportService.getAccountsReceivable(startDate, endDate), "contas-a-receber", "Contas a Receber",
                "Cliente", "Recebimento", "RECEIVED", "Recebido", startDate, endDate);
    }

    /** Contas a pagar e a receber usam o mesmo template — só mudam os rótulos e o status de liquidação. */
    private PdfReport contas(List<AccountReportRowDTO> contas, String nomeArquivo, String titulo, String rotuloParte,
                             String rotuloLiquidacao, String statusLiquidado, String rotuloLiquidado,
                             LocalDate startDate, LocalDate endDate) {
        Map<String, Object> dados = new HashMap<>();
        dados.put("contas", contas);
        dados.put("rotuloParte", rotuloParte);
        dados.put("rotuloLiquidacao", rotuloLiquidacao);
        dados.put("rotuloLiquidado", rotuloLiquidado);
        dados.put("total", soma(contas, AccountReportRowDTO::getAmount));
        dados.put("liquidado", somaPorStatus(contas, statusLiquidado));
        dados.put("aVencer", somaPorStatus(contas, "PENDING"));
        dados.put("vencido", somaPorStatus(contas, "OVERDUE"));
        dados.put("quantidadeVencidas", contas.stream().filter(c -> "OVERDUE".equals(c.getStatus())).count());
        return gerar("contas", titulo, nomeArquivo, startDate, endDate, dados);
    }

    // ============================ Compras e estoque ============================

    public PdfReport purchases(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<PurchaseHistoryDTO> compras = reportService.getPurchaseHistory(startDate, endDate);
        BigDecimal total = soma(compras, PurchaseHistoryDTO::getTotal);

        Map<String, Object> dados = new HashMap<>();
        dados.put("compras", compras);
        dados.put("porFornecedor", agrupar(compras, c -> c.getSupplierName() != null ? c.getSupplierName() : "Sem fornecedor",
                PurchaseHistoryDTO::getTotal));
        dados.put("porFormaPagamento", agrupar(compras, c -> fmt.formaPagamento(c.getPaymentMethod()), PurchaseHistoryDTO::getTotal));
        dados.put("total", total);
        dados.put("mediaPorCompra", media(total, compras.size()));
        return gerar("compras", "Histórico de Compras", startDate, endDate, dados);
    }

    public PdfReport stockPosition(boolean onlyBelowMinimum) {
        List<StockPositionDTO> produtos = reportService.getStockPosition();
        if (onlyBelowMinimum) {
            produtos = produtos.stream().filter(StockPositionDTO::isBelowMinimum).collect(Collectors.toList());
        }

        Map<String, Object> dados = new HashMap<>();
        dados.put("produtos", produtos);
        dados.put("apenasAbaixoDoMinimo", onlyBelowMinimum);
        dados.put("paisagem", true);
        dados.put("quantidadeAbaixoDoMinimo", produtos.stream().filter(StockPositionDTO::isBelowMinimum).count());
        dados.put("valorTotal", soma(produtos, StockPositionDTO::getStockValue));
        dados.put("porTipo", agrupar(produtos, p -> fmt.tipoProduto(p.getTipo()), StockPositionDTO::getStockValue));
        String titulo = onlyBelowMinimum ? "Produtos Abaixo do Estoque Mínimo" : "Posição de Estoque";
        return gerar("posicao-estoque", titulo, "posicao-estoque", "Posição em " + fmt.data(LocalDate.now()), dados);
    }

    public PdfReport stockMovement(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<StockMovementReportDTO> movimentos = reportService.getStockMovementReport(startDate, endDate);

        Map<String, Object> dados = new HashMap<>();
        dados.put("movimentos", movimentos);
        dados.put("porTipo", agrupar(movimentos, m -> fmt.tipoMovimento(m.getType()), m -> BigDecimal.ZERO));
        return gerar("movimentacao-estoque", "Movimentação de Estoque", startDate, endDate, dados);
    }

    public PdfReport loss(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<LossReportDTO> perdas = reportService.getLossReport(startDate, endDate);

        Map<String, Object> dados = new HashMap<>();
        dados.put("perdas", perdas);
        dados.put("porMotivo", agrupar(perdas, p -> fmt.motivoPerda(p.getReason()), LossReportDTO::getQuantity));
        dados.put("porOrigem", agrupar(perdas, p -> fmt.origemPerda(p.getSource()), LossReportDTO::getQuantity));
        return gerar("perdas", "Quebras e Perdas", startDate, endDate, dados);
    }

    // ============================ Produção e auditoria ============================

    public PdfReport technicalSheets() {
        List<TechnicalSheetCostReportDTO> fichas = reportService.getTechnicalSheetCosts();

        Map<String, Object> dados = new HashMap<>();
        dados.put("fichas", fichas);
        dados.put("abaixoDaMargem", fichas.stream()
                .filter(f -> f.getRealMarginPercent() != null
                        && f.getRealMarginPercent().compareTo(f.getCost().desiredMarginPercent()) < 0)
                .count());
        return gerar("fichas-tecnicas", "Custo e Margem das Fichas Técnicas", "fichas-tecnicas",
                "Posição em " + fmt.data(LocalDate.now()), dados);
    }

    public PdfReport activityLog(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<ActivityLog> eventos = reportService.getActivityLog(startDate, endDate);

        Map<String, Object> dados = new HashMap<>();
        dados.put("eventos", eventos);
        dados.put("porAcao", agrupar(eventos, e -> fmt.acao(e.getAcao()), e -> BigDecimal.ZERO));
        dados.put("porUsuario", agrupar(eventos, e -> e.getUsuarioNome() != null ? e.getUsuarioNome() : "Sistema",
                e -> BigDecimal.ZERO));
        return gerar("auditoria", "Trilha de Auditoria", startDate, endDate, dados);
    }

    // ================================ Apoio ================================

    private void validarPeriodo(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new BusinessException(ErrorCode.REPORT_PERIODO_INVALIDO);
        }
    }

    private PdfReport gerar(String template, String titulo, LocalDate startDate, LocalDate endDate, Map<String, Object> dados) {
        return gerar(template, titulo, template, startDate, endDate, dados);
    }

    private PdfReport gerar(String template, String titulo, String nomeArquivo, LocalDate startDate, LocalDate endDate,
                            Map<String, Object> dados) {
        String periodo = "Período: " + fmt.data(startDate) + " a " + fmt.data(endDate);
        byte[] pdf = renderer.render(template, titulo, periodo, dados);
        return new PdfReport("sigrest-" + nomeArquivo + "_" + startDate + "_a_" + endDate + ".pdf", pdf);
    }

    private PdfReport gerar(String template, String titulo, String nomeArquivo, String periodo, Map<String, Object> dados) {
        byte[] pdf = renderer.render(template, titulo, periodo, dados);
        return new PdfReport("sigrest-" + nomeArquivo + "_" + LocalDate.now() + ".pdf", pdf);
    }

    private static <T> BigDecimal soma(List<T> itens, Function<T, BigDecimal> valor) {
        return itens.stream().map(valor).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static <T> BigDecimal maximo(List<T> itens, Function<T, BigDecimal> valor) {
        return itens.stream().map(valor).filter(v -> v != null).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
    }

    private static BigDecimal media(BigDecimal total, int quantidade) {
        return quantidade > 0 ? total.divide(BigDecimal.valueOf(quantidade), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private static BigDecimal somaPorStatus(List<AccountReportRowDTO> contas, String status) {
        return soma(contas.stream().filter(c -> status.equals(c.getStatus())).collect(Collectors.toList()),
                AccountReportRowDTO::getAmount);
    }

    /** Agrupa por rótulo somando contagem e valor, do maior valor (ou maior contagem) para o menor. */
    private static <T> List<ReportGroupTotalDTO> agrupar(List<T> itens, Function<T, String> rotulo, Function<T, BigDecimal> valor) {
        Map<String, ReportGroupTotalDTO> grupos = new LinkedHashMap<>();
        for (T item : itens) {
            BigDecimal v = valor.apply(item) != null ? valor.apply(item) : BigDecimal.ZERO;
            grupos.merge(rotulo.apply(item), new ReportGroupTotalDTO(rotulo.apply(item), 1L, v),
                    (a, b) -> new ReportGroupTotalDTO(a.getLabel(), a.getCount() + 1, a.getTotal().add(b.getTotal())));
        }
        return grupos.values().stream()
                .sorted(Comparator.comparing(ReportGroupTotalDTO::getTotal)
                        .thenComparing(ReportGroupTotalDTO::getCount)
                        .reversed())
                .collect(Collectors.toList());
    }
}
