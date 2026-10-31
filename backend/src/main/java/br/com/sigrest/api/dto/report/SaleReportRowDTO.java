package br.com.sigrest.api.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleReportRowDTO {
    private Long saleId;
    private LocalDateTime date;
    private String customerName;
    private String paymentMethod;
    private Integer itemCount;
    private BigDecimal discount;
    private BigDecimal total;
}
