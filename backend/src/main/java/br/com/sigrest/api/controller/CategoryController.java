package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.CategoryRequestDTO;
import br.com.sigrest.api.dto.CategoryResponseDTO;
import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("category")
public class CategoryController {

    @Autowired
    private CategoryRepository repository;

    @PostMapping
    public void saveCategory(@RequestBody CategoryRequestDTO data){
        Category categoryData = new Category(data);
        repository.save(categoryData);
    }

    @GetMapping
    public List<CategoryResponseDTO> getAll(){
        return repository.findAll().stream().filter(Category::isActive).map(CategoryResponseDTO::new).toList();
    }

    @GetMapping("/{id}")
    public CategoryResponseDTO getCategoryById(@PathVariable Long id){
        Category category = repository.findById(id).orElseThrow(() -> new RuntimeException("Categoria nÃ£o encontrada"));
        return new CategoryResponseDTO(category);
    }

    @PutMapping("/{id}")
    public CategoryResponseDTO updateCategory(@PathVariable Long id, @RequestBody CategoryRequestDTO data) {
        Category category = repository.findById(id).orElseThrow(() -> new RuntimeException("Categoria nÃ£o encontrada"));
        category.setName(data.name());
        category.setDescription(data.description());
        repository.save(category);
        return new CategoryResponseDTO(category);
    }

    /** Nunca remove fisicamente: so desativa, preservando produtos que ja apontam para esta categoria. */
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        category.setActive(false);
        repository.save(category);
    }
}

