package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.ProductRequestDTO;
import br.com.sigrest.api.dto.ProductResponseDTO;
import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("product")
public class ProductController {

    @Autowired
    private ProductRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveProduct(@RequestBody ProductRequestDTO data){
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
    @GetMapping("/{id}")
    public ProductResponseDTO getProductById(@PathVariable Long id){
        Product product = repository.findById(id).orElseThrow(() -> new RuntimeException("Produto nÃ£o encontrada"));
        return new ProductResponseDTO(product);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public ProductResponseDTO updatePerson(@PathVariable Long id, @RequestBody ProductRequestDTO data) {
        Product product = repository.findById(id).orElseThrow(() -> new RuntimeException("Product nÃ£o encontrada"));
        product.setName(data.name());
        product.setCode(data.code());
        product.setStorage(data.storage());
        product.setMinStorage(data.minStorage());
        product.setPrice(data.price());
        product.setSellPrice(data.sellPrice());
        
        if (data.categoryId() != null) {
            Category category = new Category();
            category.setId(data.categoryId());
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        Product updatedProduct = repository.save(product);

        return new ProductResponseDTO(updatedProduct);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
