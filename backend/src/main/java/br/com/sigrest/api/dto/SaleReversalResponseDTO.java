package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.SaleReversal;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleReversalResponseDTO(
        Long id,
        LocalDateTime date,
        String reason,
        BigDecimal amount,
        String userName,
        List<Item> items
) {
    public record Item(String productName, BigDecimal quantity) {
    }

    public SaleReversalResponseDTO(SaleReversal reversal) {
        this(reversal.getId(), reversal.getDate(), reversal.getReason(), reversal.getAmount(),
             reversal.getUser() != null ? reversal.getUser().getName() : null,
             reversal.getItems().stream()
                     .map(item -> new Item(
                             item.getSellItem().getProduct() != null ? item.getSellItem().getProduct().getName() : null,
                             item.getQuantity()))
                     .toList());
    }
}
