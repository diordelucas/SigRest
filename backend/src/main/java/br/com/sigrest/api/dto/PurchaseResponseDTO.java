package br.com.sigrest.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseResponseDTO {
    private Long id;
    private LocalDate date;
    private BigDecimal total;
    private String paymentMethod;
    private SupplierResponseDTO supplier;
    private List<PurchaseItemResponseDTO> items;
}
