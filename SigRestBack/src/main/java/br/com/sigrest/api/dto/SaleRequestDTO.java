package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Sale;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public record SaleRequestDTO(Long id, Date date, BigDecimal total, Integer discount, String paymentMethod, Long personId, List<SellItemRequestDTO> items) {
    public SaleRequestDTO(Sale sale){
        this(sale.getId(), sale.getDate(), sale.getTotal(), sale.getDiscount(), sale.getPaymentMethod(),
             sale.getPerson() != null ? sale.getPerson().getId() : null,
             sale.getItems() != null ? sale.getItems().stream().map(SellItemRequestDTO::new).collect(Collectors.toList()) : null);
    }
}

