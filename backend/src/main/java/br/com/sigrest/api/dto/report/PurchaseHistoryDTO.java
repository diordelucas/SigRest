package br.com.sigrest.api.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseHistoryDTO {
    private Long purchaseId;
    private LocalDate date;
    private String supplierName;
    private String paymentMethod;
    private Integer itemCount;
    private BigDecimal total;
}
