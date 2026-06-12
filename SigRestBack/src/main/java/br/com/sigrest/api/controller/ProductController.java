package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.ProductRequestDTO;
import br.com.sigrest.api.dto.ProductResponseDTO;
import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.repository.CategoryRepository;
import br.com.sigrest.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("product")
public class ProductController {

    @Autowired
    private ProductRepository repository;

    @Autowired
    private CategoryRepository categoryRepository;

    /** Garante que a categoria foi informada e existe. Categoria é obrigatória no produto. */
    private void validateCategory(Long categoryId) {
        if (categoryId == null) {
            throw new BusinessException("A categoria do produto é obrigatória.", HttpStatus.BAD_REQUEST);
        }
        if (!categoryRepository.existsById(categoryId)) {
            throw new BusinessException("Categoria informada não encontrada.", HttpStatus.NOT_FOUND);
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveProduct(@RequestBody ProductRequestDTO data){
        validateCategory(data.categoryId());
        Product productData = new Product(data);
        repository.save(productData);
        return;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<ProductResponseDTO> getAll(){
        List<ProductResponseDTO> productList = repository.findAll().stream().map(ProductResponseDTO::new).toList();
        return productList;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/low-stock")
    public List<ProductResponseDTO> getLowStock(){
        List<ProductResponseDTO> lowStockList = repository.findLowStockProducts().stream().map(ProductResponseDTO::new).toList();
        return lowStockList;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public ProductResponseDTO getProductById(@PathVariable Long id){
        Product product = repository.findById(id).orElseThrow(() -> new BusinessException("Produto não encontrado.", HttpStatus.NOT_FOUND));
        return new ProductResponseDTO(product);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public ProductResponseDTO updatePerson(@PathVariable Long id, @RequestBody ProductRequestDTO data) {
        validateCategory(data.categoryId());

        Product product = repository.findById(id).orElseThrow(() -> new BusinessException("Produto não encontrado.", HttpStatus.NOT_FOUND));
        product.setName(data.name());
        product.setCode(data.code());
        product.setStorage(data.storage());
        product.setMinStorage(data.minStorage());
        product.setPrice(data.price());
        product.setSellPrice(data.sellPrice());

        Category category = new Category();
        category.setId(data.categoryId());
        product.setCategory(category);

        Product updatedProduct = repository.save(product);

        return new ProductResponseDTO(updatedProduct);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
