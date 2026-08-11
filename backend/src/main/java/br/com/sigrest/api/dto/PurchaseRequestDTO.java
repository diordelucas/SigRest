package br.com.sigrest.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseRequestDTO {
    private LocalDate date;
    private BigDecimal total;
    private Long supplierId;
    private List<PurchaseItemRequestDTO> items;
}
