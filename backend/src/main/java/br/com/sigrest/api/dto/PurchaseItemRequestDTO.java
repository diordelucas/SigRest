package br.com.sigrest.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseItemRequestDTO {
    private Long productId;
    private Integer quantity;
    private BigDecimal unitPrice;
}
