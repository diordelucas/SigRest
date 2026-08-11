package br.com.sigrest.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseItemResponseDTO {
    private Long id;
    private ProductResponseDTO product;
    private Integer quantity;
    private BigDecimal unitPrice;
}
