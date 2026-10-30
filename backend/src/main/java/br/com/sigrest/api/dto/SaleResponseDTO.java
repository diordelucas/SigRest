package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Sale;
import br.com.sigrest.api.entity.SaleStatus;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public record SaleResponseDTO(
        Long id,
        Date date,
        BigDecimal total,
        BigDecimal discount,
        String paymentMethod,
        String personName,
        SaleStatus status,
        Date reversalDate,
        String reversalReason,
        String reversedByName,
        List<SellItemResponseDTO> items
) {
    public SaleResponseDTO(Sale sale){
        this(sale.getId(), sale.getDate(), sale.getTotal(), sale.getDiscount(), sale.getPaymentMethod(),
             sale.getPerson() != null ? sale.getPerson().getName() : null,
             sale.getStatus(),
             sale.getReversalDate(),
             sale.getReversalReason(),
             sale.getReversedBy() != null ? sale.getReversedBy().getName() : null,
             sale.getItems() != null ? sale.getItems().stream().map(SellItemResponseDTO::new).collect(Collectors.toList()) : null);
    }
}
