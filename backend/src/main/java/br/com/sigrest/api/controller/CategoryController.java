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

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveCategory(@RequestBody CategoryRequestDTO data){
        Category categoryData = new Category(data);
        repository.save(categoryData);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<CategoryResponseDTO> getAll(){
        return repository.findAll().stream().map(CategoryResponseDTO::new).toList();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public CategoryResponseDTO getCategoryById(@PathVariable Long id){
        Category category = repository.findById(id).orElseThrow(() -> new RuntimeException("Categoria nÃ£o encontrada"));
        return new CategoryResponseDTO(category);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public CategoryResponseDTO updateCategory(@PathVariable Long id, @RequestBody CategoryRequestDTO data) {
        Category category = repository.findById(id).orElseThrow(() -> new RuntimeException("Categoria nÃ£o encontrada"));
        category.setName(data.name());
        category.setDescription(data.description());
        repository.save(category);
        return new CategoryResponseDTO(category);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        repository.deleteById(id);
    }
}

