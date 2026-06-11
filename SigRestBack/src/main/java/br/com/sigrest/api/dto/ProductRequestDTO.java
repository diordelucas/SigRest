package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Product;

import java.math.BigDecimal;

public record ProductRequestDTO(Long id, String name, String code, BigDecimal price, BigDecimal sellPrice, Integer storage, Integer minStorage, Long categoryId) {
    public ProductRequestDTO(Product product){
        this(product.getId(), product.getName(), product.getCode(), product.getPrice(), product.getSellPrice(), product.getStorage(), product.getMinStorage(), product.getCategory() != null ? product.getCategory().getId() : null);
    }
}

