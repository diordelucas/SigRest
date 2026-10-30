package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.ProductRequestDTO;
import br.com.sigrest.api.dto.ProductResponseDTO;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductType;
import br.com.sigrest.api.entity.TechnicalSheet;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.repository.CategoryRepository;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.TechnicalSheetRepository;
import br.com.sigrest.api.service.StockMovementService;
import br.com.sigrest.api.service.audit.LogAtividadeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("product")
public class ProductController {

    @Autowired
    private ProductRepository repository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TechnicalSheetRepository technicalSheetRepository;

    @Autowired
    private StockMovementService stockMovementService;

    @Autowired
    private LogAtividadeService logAtividadeService;

    private void validateProduct(ProductRequestDTO data, Long id) {
        validateCategory(data.categoryId());
        if (data.code() != null && !data.code().isBlank()) {
            boolean duplicado = id == null
                    ? repository.existsByCodeIgnoreCaseAndActiveTrue(data.code().trim())
                    : repository.existsByCodeIgnoreCaseAndActiveTrueAndIdNot(data.code().trim(), id);
            if (duplicado) {
                throw new BusinessException(ErrorCode.PROD_CODIGO_DUPLICADO);
            }
        }
        if (data.tipo() == ProductType.INSUMO && (data.purchaseUnit() == null || data.packageQuantity() == null
                || data.packageQuantity().signum() <= 0)) {
            throw new BusinessException(ErrorCode.PROD_INSUMO_SEM_UNIDADE);
        }
        if (data.tipo() == ProductType.PRODUTO_FINAL && (data.sellPrice() == null || data.sellPrice().signum() <= 0)) {
            throw new BusinessException(ErrorCode.PROD_PRECO_VENDA_OBRIGATORIO);
        }
    }

    /** Garante que a categoria foi informada e existe. Categoria é obrigatória no produto. */
    private void validateCategory(Long categoryId) {
        if (categoryId == null) {
            throw new BusinessException(ErrorCode.PROD_CATEGORIA_OBRIGATORIA);
        }
        if (!categoryRepository.existsById(categoryId)) {
            throw new BusinessException(ErrorCode.CAT_NAO_ENCONTRADA);
        }
    }

    /** O estoque inicial entra como movimentação, para o histórico fechar com o saldo do produto. */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @PostMapping
    public void saveProduct(@Valid @RequestBody ProductRequestDTO data){
        validateProduct(data, null);
        Product productData = new Product(data);
        productData.setStorage(BigDecimal.ZERO);
        if (productData.getSellPrice() == null) {
            productData.setSellPrice(BigDecimal.ZERO);
        }
        Product saved = repository.save(productData);
        if (data.storage() != null && data.storage().signum() > 0) {
            stockMovementService.createStockEntry(saved, data.storage(), "Estoque inicial no cadastro do produto");
        }
    }

    @GetMapping
    public List<ProductResponseDTO> getAll(){
        List<ProductResponseDTO> productList = repository.findAll().stream()
                .filter(Product::isActive)
                .map(ProductResponseDTO::new).toList();
        return productList;
    }

    @GetMapping("/low-stock")
    public List<ProductResponseDTO> getLowStock(){
        List<ProductResponseDTO> lowStockList = repository.findLowStockProducts().stream().map(ProductResponseDTO::new).toList();
        return lowStockList;
    }

    @GetMapping("/{id}")
    public ProductResponseDTO getProductById(@PathVariable Long id){
        Product product = repository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.PROD_NAO_ENCONTRADO));
        return new ProductResponseDTO(product);
    }

    /** Mudar o estoque aqui gera uma movimentação de ajuste: nenhum saldo muda sem deixar rastro. */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @PutMapping("/{id}")
    public ProductResponseDTO updatePerson(@PathVariable Long id, @Valid @RequestBody ProductRequestDTO data) {
        validateProduct(data, id);
        Product product = repository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.PROD_NAO_ENCONTRADO));
        BigDecimal previousStock = product.getStorage() != null ? product.getStorage() : BigDecimal.ZERO;
        BigDecimal informedStock = data.storage() != null ? data.storage() : previousStock;
        product.setName(data.name());
        product.setCode(data.code());
        product.setMinStorage(data.minStorage());
        product.setPrice(data.price());
        product.setSellPrice(data.sellPrice() != null ? data.sellPrice() : BigDecimal.ZERO);
        product.setTipo(data.tipo());
        product.setPurchaseUnit(data.purchaseUnit());
        product.setPackageQuantity(data.packageQuantity());

        product.setCategory(categoryRepository.findById(data.categoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CAT_NAO_ENCONTRADA)));
        Product updatedProduct = repository.save(product);

        BigDecimal difference = informedStock.subtract(previousStock);
        if (difference.signum() != 0) {
            String description = "Ajuste manual no cadastro do produto";
            if (difference.signum() > 0) {
                stockMovementService.createStockEntry(updatedProduct, difference, description);
            } else {
                stockMovementService.createStockExit(updatedProduct, difference.negate(), description);
            }
            logAtividadeService.registrar("AJUSTE_ESTOQUE", "Product", updatedProduct.getId(),
                    updatedProduct.getName() + ": de " + previousStock + " para " + informedStock,
                    logAtividadeService.usuarioAtual());
        }

        return new ProductResponseDTO(updatedProduct);
    }

    /**
     * Exclusao de produto e privilegio de administrador (ver TCC, secao 5.1).
     * Nunca remove fisicamente: so desativa, preservando vendas, compras e
     * fichas tecnicas que ja referenciam este produto.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROD_NAO_ENCONTRADO));
        List<TechnicalSheet> sheets = technicalSheetRepository.findDistinctByFinalProductIdOrItemsRawMaterialId(id, id);
        if (!sheets.isEmpty()) {
            throw new BusinessException(ErrorCode.PROD_EM_USO_NA_FICHA,
                    "Este produto é usado na ficha técnica \"" + sheets.get(0).getName() + "\" e não pode ser excluído.");
        }
        product.setActive(false);
        repository.save(product);
    }
}
