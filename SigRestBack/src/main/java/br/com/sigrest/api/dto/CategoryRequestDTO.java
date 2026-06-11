package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Category;

public record CategoryRequestDTO(Long id, String name, String description) {
    public CategoryRequestDTO(Category category) {
        this(category.getId(), category.getName(), category.getDescription());
    }
}

