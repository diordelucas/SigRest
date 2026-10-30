package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.CategoryRequestDTO;
import br.com.sigrest.api.dto.CategoryResponseDTO;
import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.repository.CategoryRepository;
import br.com.sigrest.api.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("category")
public class CategoryController {

    @Autowired
    private CategoryRepository repository;

    @Autowired
    private ProductRepository productRepository;

    private void validateName(String name, Long id) {
        boolean duplicada = id == null
                ? repository.existsByNameIgnoreCaseAndActiveTrue(name.trim())
                : repository.existsByNameIgnoreCaseAndActiveTrueAndIdNot(name.trim(), id);
        if (duplicada) {
            throw new BusinessException(ErrorCode.CAT_NOME_DUPLICADO);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public void saveCategory(@Valid @RequestBody CategoryRequestDTO data){
        validateName(data.name(), null);
        Category categoryData = new Category(data);
        repository.save(categoryData);
    }

    @GetMapping
    public List<CategoryResponseDTO> getAll(){
        return repository.findAll().stream().filter(Category::isActive).map(CategoryResponseDTO::new).toList();
    }

    @GetMapping("/{id}")
    public CategoryResponseDTO getCategoryById(@PathVariable Long id){
        Category category = repository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.CAT_NAO_ENCONTRADA));
        return new CategoryResponseDTO(category);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public CategoryResponseDTO updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequestDTO data) {
        validateName(data.name(), id);
        Category category = repository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.CAT_NAO_ENCONTRADA));
        category.setName(data.name());
        category.setDescription(data.description());
        repository.save(category);
        return new CategoryResponseDTO(category);
    }

    /** Nunca remove fisicamente: so desativa. Categoria com produto ativo nao pode ser excluida. */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CAT_NAO_ENCONTRADA));
        long produtos = productRepository.countByCategoryIdAndActiveTrue(id);
        if (produtos > 0) {
            throw new BusinessException(ErrorCode.CAT_EM_USO,
                    "Esta categoria tem " + produtos + " produto(s) ativo(s). Mova os produtos para outra categoria antes de excluir.");
        }
        category.setActive(false);
        repository.save(category);
    }
}

