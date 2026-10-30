package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.CostCalculationResponseDTO;
import br.com.sigrest.api.dto.report.AccountReportRowDTO;
import br.com.sigrest.api.dto.report.FinancialFlowDTO;
import br.com.sigrest.api.dto.report.LossReportDTO;
import br.com.sigrest.api.dto.report.MonthlyRevenueDTO;
import br.com.sigrest.api.dto.report.ProductSalesDTO;
import br.com.sigrest.api.dto.report.PurchaseHistoryDTO;
import br.com.sigrest.api.dto.report.SaleReportRowDTO;
import br.com.sigrest.api.dto.report.SalesByPeriodDTO;
import br.com.sigrest.api.dto.report.StockMovementReportDTO;
import br.com.sigrest.api.dto.report.StockPositionDTO;
import br.com.sigrest.api.dto.report.TechnicalSheetCostReportDTO;
import br.com.sigrest.api.entity.AccountPayable;
import br.com.sigrest.api.entity.AccountReceivable;
import br.com.sigrest.api.entity.ActivityLog;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductionOrder;
import br.com.sigrest.api.entity.Sale;
import br.com.sigrest.api.entity.SaleStatus;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.entity.SellItem;
import br.com.sigrest.api.entity.StockMovement;
import br.com.sigrest.api.entity.TechnicalSheet;
import br.com.sigrest.api.repository.AccountPayableRepository;
import br.com.sigrest.api.repository.AccountReceivableRepository;
import br.com.sigrest.api.repository.ActivityLogRepository;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.ProductionOrderRepository;
import br.com.sigrest.api.repository.PurchaseRepository;
import br.com.sigrest.api.repository.SaleRepository;
import br.com.sigrest.api.repository.StockMovementRepository;
import br.com.sigrest.api.repository.TechnicalSheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductionOrderRepository productionOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AccountPayableRepository accountPayableRepository;

    @Autowired
    private AccountReceivableRepository accountReceivableRepository;

    @Autowired
    private TechnicalSheetRepository technicalSheetRepository;

    @Autowired
    private TechnicalSheetService technicalSheetService;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public List<SalesByPeriodDTO> getSalesByPeriod(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<Sale> sales = saleRepository.findAll().stream()
                .filter(sale -> sale.getStatus() == SaleStatus.COMPLETED)
                .filter(sale -> {
                    LocalDate saleDate = sale.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    return !saleDate.isBefore(startDate) && !saleDate.isAfter(endDate);
                })
                .collect(Collectors.toList());

        Map<LocalDate, List<Sale>> salesByDate = sales.stream()
                .collect(Collectors.groupingBy(sale -> sale.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()));

        return salesByDate.entrySet().stream()
                .map(entry -> new SalesByPeriodDTO(
                        entry.getKey(),
                        (long) entry.getValue().size(),
                        entry.getValue().stream().map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(SalesByPeriodDTO::getDate))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductSalesDTO> getTopSellingProducts(int limit) {
        List<Sale> sales = saleRepository.findAll();

        Map<Long, List<SellItem>> itemsByProduct = sales.stream()
                .filter(sale -> sale.getStatus() == SaleStatus.COMPLETED)
                .flatMap(sale -> sale.getItems().stream())
                .collect(Collectors.groupingBy(item -> item.getProduct().getId()));

        return itemsByProduct.entrySet().stream()
                .map(entry -> {
                    Long productId = entry.getKey();
                    String productName = entry.getValue().get(0).getProduct().getName(); // Assuming product name is consistent
                    Long totalQuantitySold = entry.getValue().stream()
                            .mapToLong(item -> item.getQuantity().longValue())
                            .sum();
                    BigDecimal totalRevenue = entry.getValue().stream()
                            .map(item -> item.getUnitPrice().multiply(item.getQuantity()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ProductSalesDTO(productId, productName, totalQuantitySold, totalRevenue);
                })
                .sorted(Comparator.comparing(ProductSalesDTO::getTotalQuantitySold).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MonthlyRevenueDTO> getMonthlyRevenue(LocalDate startMonth, LocalDate endMonth) {
        validarPeriodo(startMonth, endMonth);
        List<Sale> sales = saleRepository.findAll().stream()
                .filter(sale -> sale.getStatus() == SaleStatus.COMPLETED)
                .filter(sale -> {
                    LocalDate saleDate = sale.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                    YearMonth saleYearMonth = YearMonth.from(saleDate);
                    return !saleYearMonth.isBefore(YearMonth.from(startMonth)) && !saleYearMonth.isAfter(YearMonth.from(endMonth));
                })
                .collect(Collectors.toList());

        Map<YearMonth, List<Sale>> salesByMonth = sales.stream()
                .collect(Collectors.groupingBy(sale -> YearMonth.from(sale.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate())));

        return salesByMonth.entrySet().stream()
                .map(entry -> new MonthlyRevenueDTO(
                        entry.getKey(),
                        entry.getValue().stream().map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(MonthlyRevenueDTO::getMonth))
                .collect(Collectors.toList());
    }

    public List<StockMovementReportDTO> getStockMovementReport(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        return stockMovementRepository.findAll().stream()
                .filter(movement -> {
                    LocalDateTime movementDateTime = movement.getDate();
                    return !movementDateTime.isBefore(startDateTime) && !movementDateTime.isAfter(endDateTime);
                })
                .map(movement -> new StockMovementReportDTO(
                        movement.getId(),
                        movement.getDate(),
                        movement.getProduct().getName(),
                        movement.getType(),
                        movement.getQuantity(),
                        movement.getDescription(),
                        movement.getProduct().getPurchaseUnit() != null
                                ? movement.getProduct().getPurchaseUnit().getBaseUnitLabel() : "un"
                ))
                .sorted(Comparator.comparing(StockMovementReportDTO::getDate))
                .collect(Collectors.toList());
    }

    public List<FinancialFlowDTO> getFinancialFlow(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        List<FinancialFlowDTO> result = new ArrayList<>();
        ZoneId zone = ZoneId.systemDefault();
        YearMonth current = YearMonth.from(startDate);
        YearMonth last = YearMonth.from(endDate);

        while (!current.isAfter(last)) {
            LocalDate firstDay = current.atDay(1);
            LocalDate lastDay = current.atEndOfMonth();

            Date startMs = Date.from(firstDay.atStartOfDay(zone).toInstant());
            Date endMs = Date.from(lastDay.plusDays(1).atStartOfDay(zone).toInstant());

            BigDecimal entradas = nullSafe(saleRepository.sumTotalBetween(startMs, endMs));
            BigDecimal saidas = nullSafe(purchaseRepository.sumTotalBetween(firstDay, lastDay));
            BigDecimal saldo = entradas.subtract(saidas);

            result.add(new FinancialFlowDTO(current.toString(), entradas, saidas, saldo));
            current = current.plusMonths(1);
        }
        return result;
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio.isAfter(fim)) {
            throw new BusinessException(ErrorCode.REPORT_PERIODO_INVALIDO);
        }
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    /**
     * Quebra no período: baixas de estoque tipo LOSS (venceu/queimou/descarte) +
     * ordens de produção finalizadas cujo rendimento real ficou abaixo do planejado.
     */
    @Transactional(readOnly = true)
    public List<LossReportDTO> getLossReport(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<LossReportDTO> result = new ArrayList<>();

        stockMovementRepository.findAll().stream()
                .filter(m -> m.getType() == StockMovement.MovementType.LOSS)
                .filter(m -> !m.getDate().isBefore(startDateTime) && !m.getDate().isAfter(endDateTime))
                .forEach(m -> result.add(new LossReportDTO(
                        "ESTOQUE",
                        m.getDate(),
                        m.getProduct() != null ? m.getProduct().getName() : null,
                        m.getReason() != null ? m.getReason().name() : null,
                        m.getQuantity(),
                        m.getDescription()
                )));

        productionOrderRepository.findAll().stream()
                .filter(o -> o.getStatus() == ProductionOrder.Status.FINISHED)
                .filter(o -> o.getActualQuantity() != null && o.getActualQuantity() < o.getQuantity())
                .filter(o -> o.getDate() != null && !o.getDate().isBefore(startDateTime) && !o.getDate().isAfter(endDateTime))
                .forEach(o -> result.add(new LossReportDTO(
                        "PRODUCAO",
                        o.getDate(),
                        o.getFinalProduct() != null ? o.getFinalProduct().getName() : null,
                        o.getLossReason() != null ? o.getLossReason().name() : null,
                        BigDecimal.valueOf(o.getQuantity() - o.getActualQuantity()),
                        "OP #" + o.getId() + " — planejado " + o.getQuantity() + ", real " + o.getActualQuantity()
                )));

        return result.stream()
                .sorted(Comparator.comparing(LossReportDTO::getDate))
                .collect(Collectors.toList());
    }

    // ===================== Consultas usadas pelos relatórios em PDF =====================

    /** Vendas do período, uma linha por venda. */
    @Transactional(readOnly = true)
    public List<SaleReportRowDTO> getSalesDetail(LocalDate startDate, LocalDate endDate) {
        ZoneId zone = ZoneId.systemDefault();
        return findSalesBetween(startDate, endDate).stream()
                .map(sale -> new SaleReportRowDTO(
                        sale.getId(),
                        LocalDateTime.ofInstant(sale.getDate().toInstant(), zone),
                        sale.getPerson() != null ? sale.getPerson().getName() : null,
                        sale.getPaymentMethod(),
                        sale.getItems() != null ? sale.getItems().size() : 0,
                        nullSafe(sale.getDiscount()),
                        nullSafe(sale.getTotal())
                ))
                .collect(Collectors.toList());
    }

    /** Produtos mais vendidos dentro do período (o endpoint JSON antigo considera todas as vendas). */
    @Transactional(readOnly = true)
    public List<ProductSalesDTO> getTopSellingProducts(LocalDate startDate, LocalDate endDate, int limit) {
        validarPeriodo(startDate, endDate);
        Map<Long, List<SellItem>> itemsByProduct = findSalesBetween(startDate, endDate).stream()
                .flatMap(sale -> sale.getItems().stream())
                .filter(item -> item.getProduct() != null)
                .collect(Collectors.groupingBy(item -> item.getProduct().getId()));

        return itemsByProduct.entrySet().stream()
                .map(entry -> new ProductSalesDTO(
                        entry.getKey(),
                        entry.getValue().get(0).getProduct().getName(),
                        entry.getValue().stream().mapToLong(item -> item.getQuantity().longValue()).sum(),
                        entry.getValue().stream()
                                .map(item -> item.getUnitPrice().multiply(item.getQuantity()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(ProductSalesDTO::getTotalQuantitySold).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<Sale> findSalesBetween(LocalDate startDate, LocalDate endDate) {
        ZoneId zone = ZoneId.systemDefault();
        Date start = Date.from(startDate.atStartOfDay(zone).toInstant());
        Date end = Date.from(endDate.atTime(LocalTime.MAX).atZone(zone).toInstant());
        return saleRepository.findByDateBetweenAndStatusOrderByDateAsc(start, end, SaleStatus.COMPLETED);
    }

    @Transactional(readOnly = true)
    public List<PurchaseHistoryDTO> getPurchaseHistory(LocalDate startDate, LocalDate endDate) {
        validarPeriodo(startDate, endDate);
        return purchaseRepository.findByDateBetweenOrderByDateAsc(startDate, endDate).stream()
                .map(purchase -> new PurchaseHistoryDTO(
                        purchase.getId(),
                        purchase.getDate(),
                        purchase.getSupplier() != null ? purchase.getSupplier().getName() : null,
                        purchase.getItems() != null ? purchase.getItems().size() : 0,
                        nullSafe(purchase.getTotal())
                ))
                .collect(Collectors.toList());
    }

    /** Posição atual do estoque de todos os produtos ativos, com valor estimado a preço de custo. */
    @Transactional(readOnly = true)
    public List<StockPositionDTO> getStockPosition() {
        return productRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(product -> {
                    BigDecimal storage = nullSafe(product.getStorage());
                    BigDecimal unitCost = costPerBaseUnit(product);
                    boolean belowMinimum = product.getMinStorage() != null && product.getMinStorage().signum() > 0
                            && storage.compareTo(product.getMinStorage()) <= 0;
                    return new StockPositionDTO(
                            product.getCode(),
                            product.getName(),
                            product.getCategory() != null ? product.getCategory().getName() : null,
                            product.getTipo(),
                            product.getPurchaseUnit() != null ? product.getPurchaseUnit().getBaseUnitLabel() : "un",
                            storage,
                            product.getMinStorage(),
                            belowMinimum,
                            unitCost,
                            unitCost != null ? storage.multiply(unitCost).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO
                    );
                })
                .collect(Collectors.toList());
    }

    /** Custo por unidade base (g, ml, un): preço da embalagem dividido pelo conteúdo dela. */
    private BigDecimal costPerBaseUnit(Product product) {
        if (product.getPrice() == null) {
            return null;
        }
        if (product.getPurchaseUnit() == null
                || product.getPackageQuantity() == null
                || product.getPackageQuantity().signum() <= 0) {
            return product.getPrice();
        }
        BigDecimal baseUnitsPerPackage = product.getPackageQuantity()
                .multiply(product.getPurchaseUnit().getConversionFactor());
        return product.getPrice().divide(baseUnitsPerPackage, 6, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public List<AccountReportRowDTO> getAccountsPayable(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        return accountPayableRepository.findByDueDateBetweenOrderByDueDateAsc(startDate, endDate).stream()
                .map(account -> accountRow(
                        account.getId(),
                        account.getDescription(),
                        account.getSupplier() != null ? account.getSupplier().getName() : null,
                        account.getDueDate(),
                        account.getPaymentDate(),
                        account.getAmount(),
                        account.getStatus() != AccountPayable.Status.PAID,
                        account.getStatus() != null ? account.getStatus().name() : null,
                        today))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccountReportRowDTO> getAccountsReceivable(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        return accountReceivableRepository.findByDueDateBetweenOrderByDueDateAsc(startDate, endDate).stream()
                .map(account -> accountRow(
                        account.getId(),
                        account.getDescription(),
                        account.getPerson() != null ? account.getPerson().getName() : null,
                        account.getDueDate(),
                        account.getReceiptDate(),
                        account.getAmount(),
                        account.getStatus() != AccountReceivable.Status.RECEIVED,
                        account.getStatus() != null ? account.getStatus().name() : null,
                        today))
                .collect(Collectors.toList());
    }

    /** Conta em aberto com vencimento já passado sai como OVERDUE, mesmo que o banco ainda diga PENDING. */
    private AccountReportRowDTO accountRow(Long id, String description, String partyName, LocalDate dueDate,
                                           LocalDate settlementDate, BigDecimal amount, boolean open,
                                           String status, LocalDate today) {
        boolean overdue = open && dueDate != null && dueDate.isBefore(today);
        return new AccountReportRowDTO(
                id,
                description,
                partyName,
                dueDate,
                settlementDate,
                nullSafe(amount),
                overdue ? "OVERDUE" : status,
                overdue ? ChronoUnit.DAYS.between(dueDate, today) : 0
        );
    }

    /** Custo de todas as fichas técnicas comparado ao preço de venda atual do produto final. */
    @Transactional(readOnly = true)
    public List<TechnicalSheetCostReportDTO> getTechnicalSheetCosts() {
        return technicalSheetRepository.findAll().stream()
                .sorted(Comparator.comparing(TechnicalSheet::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(sheet -> {
                    CostCalculationResponseDTO cost = technicalSheetService.calculateCost(sheet.getId());
                    BigDecimal sellPrice = sheet.getFinalProduct() != null ? sheet.getFinalProduct().getSellPrice() : null;
                    BigDecimal realMargin = null;
                    if (sellPrice != null && sellPrice.signum() > 0) {
                        BigDecimal costShare = cost.servingCostWithLabour()
                                .multiply(new BigDecimal("100"))
                                .divide(sellPrice, 4, RoundingMode.HALF_UP);
                        realMargin = new BigDecimal("100")
                                .subtract(cost.variableExpensesPercent())
                                .subtract(costShare)
                                .setScale(2, RoundingMode.HALF_UP);
                    }
                    return new TechnicalSheetCostReportDTO(
                            sheet.getFinalProduct() != null ? sheet.getFinalProduct().getName() : null,
                            sellPrice,
                            realMargin,
                            cost
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getActivityLog(LocalDate startDate, LocalDate endDate) {
        return activityLogRepository.findByDataHoraBetweenOrderByDataHoraAsc(
                startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));
    }
}
