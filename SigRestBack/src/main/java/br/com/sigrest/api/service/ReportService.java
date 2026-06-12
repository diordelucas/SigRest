package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.report.FinancialFlowDTO;
import br.com.sigrest.api.dto.report.MonthlyRevenueDTO;
import br.com.sigrest.api.dto.report.ProductSalesDTO;
import br.com.sigrest.api.dto.report.SalesByPeriodDTO;
import br.com.sigrest.api.dto.report.StockMovementReportDTO;
import br.com.sigrest.api.entity.Sale;
import br.com.sigrest.api.entity.SellItem;
import br.com.sigrest.api.repository.PurchaseRepository;
import br.com.sigrest.api.repository.SaleRepository;
import br.com.sigrest.api.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
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

    public List<SalesByPeriodDTO> getSalesByPeriod(LocalDate startDate, LocalDate endDate) {
        List<Sale> sales = saleRepository.findAll().stream()
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

    public List<ProductSalesDTO> getTopSellingProducts(int limit) {
        List<Sale> sales = saleRepository.findAll();

        Map<Long, List<SellItem>> itemsByProduct = sales.stream()
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

    public List<MonthlyRevenueDTO> getMonthlyRevenue(LocalDate startMonth, LocalDate endMonth) {
        List<Sale> sales = saleRepository.findAll().stream()
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
                        movement.getDescription()
                ))
                .sorted(Comparator.comparing(StockMovementReportDTO::getDate))
                .collect(Collectors.toList());
    }

    public List<FinancialFlowDTO> getFinancialFlow(LocalDate startDate, LocalDate endDate) {
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

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}

