package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.DashboardSummaryDTO;
import br.com.sigrest.api.repository.AccountPayableRepository;
import br.com.sigrest.api.repository.AccountReceivableRepository;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.SaleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Date;

@Service
public class DashboardService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final AccountReceivableRepository receivableRepository;
    private final AccountPayableRepository payableRepository;

    public DashboardService(SaleRepository saleRepository,
                            ProductRepository productRepository,
                            AccountReceivableRepository receivableRepository,
                            AccountPayableRepository payableRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.receivableRepository = receivableRepository;
        this.payableRepository = payableRepository;
    }

    public DashboardSummaryDTO getSummary() {
        ZoneId zone = ZoneId.systemDefault();

        LocalDate today = LocalDate.now();
        Date startOfDay = Date.from(today.atStartOfDay(zone).toInstant());
        Date endOfDay = Date.from(today.plusDays(1).atStartOfDay(zone).toInstant());

        YearMonth month = YearMonth.now();
        Date startOfMonth = Date.from(month.atDay(1).atStartOfDay(zone).toInstant());
        Date startOfNextMonth = Date.from(month.plusMonths(1).atDay(1).atStartOfDay(zone).toInstant());

        BigDecimal todayRevenue = nullSafe(saleRepository.sumTotalBetween(startOfDay, endOfDay));
        long todaySalesCount = saleRepository.countSalesBetween(startOfDay, endOfDay);
        BigDecimal monthRevenue = nullSafe(saleRepository.sumTotalBetween(startOfMonth, startOfNextMonth));
        long lowStockCount = productRepository.findLowStockProducts().size();

        BigDecimal totalReceivable = nullSafe(receivableRepository.sumPending());
        BigDecimal totalPayable = nullSafe(payableRepository.sumPending());
        BigDecimal balanceForecast = totalReceivable.subtract(totalPayable);

        return new DashboardSummaryDTO(todayRevenue, todaySalesCount, monthRevenue, lowStockCount,
                totalReceivable, totalPayable, balanceForecast);
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}