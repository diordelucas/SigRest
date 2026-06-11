package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Category;

public record CategoryResponseDTO(Long id, String name, String description) {
    public CategoryResponseDTO(Category category) {
        this(category.getId(), category.getName(), category.getDescription());
    }
}

