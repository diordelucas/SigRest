package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Product;

import java.math.BigDecimal;

public record ProductResponseDTO(Long id, String name, String code, BigDecimal price, BigDecimal sellPrice, Integer storage, Integer minStorage, Long categoryId, String categoryName) {
    public ProductResponseDTO(Product product) {
        this(product.getId(), product.getName(), product.getCode(), product.getPrice(), product.getSellPrice(), product.getStorage(), product.getMinStorage(), product.getCategory() != null ? product.getCategory().getId() : null, product.getCategory() != null ? product.getCategory().getName() : null);
    }
}
