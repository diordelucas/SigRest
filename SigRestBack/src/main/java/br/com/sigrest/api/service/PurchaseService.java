package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.PurchaseRequestDTO;
import br.com.sigrest.api.dto.PurchaseResponseDTO;
import br.com.sigrest.api.dto.SupplierResponseDTO;
import br.com.sigrest.api.dto.ProductResponseDTO;
import br.com.sigrest.api.dto.PurchaseItemResponseDTO;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.Purchase;
import br.com.sigrest.api.entity.PurchaseItem;
import br.com.sigrest.api.entity.Supplier;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.PurchaseRepository;
import br.com.sigrest.api.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMovementService stockMovementService; // Assuming this service will be created later

    @Transactional
    public PurchaseResponseDTO createPurchase(PurchaseRequestDTO purchaseRequestDTO) {
        Purchase purchase = new Purchase();
        purchase.setDate(purchaseRequestDTO.getDate());

        Supplier supplier = supplierRepository.findById(purchaseRequestDTO.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        purchase.setSupplier(supplier);

        BigDecimal total = BigDecimal.ZERO;
        for (var itemDTO : purchaseRequestDTO.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            PurchaseItem purchaseItem = new PurchaseItem();
            purchaseItem.setProduct(product);
            purchaseItem.setQuantity(itemDTO.getQuantity());
            purchaseItem.setUnitPrice(itemDTO.getUnitPrice());
            purchaseItem.setPurchase(purchase);
            purchase.getItems().add(purchaseItem);

            total = total.add(itemDTO.getUnitPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));

            // Create stock movement for entry
            stockMovementService.createStockEntry(product, itemDTO.getQuantity(), "Purchase " + purchase.getId());
        }
        purchase.setTotal(total);

        Purchase savedPurchase = purchaseRepository.save(purchase);
        return convertToResponseDTO(savedPurchase);
    }

    public List<PurchaseResponseDTO> getAllPurchases() {
        return purchaseRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public PurchaseResponseDTO getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        return convertToResponseDTO(purchase);
    }

    // Helper method to convert Purchase to PurchaseResponseDTO
    private PurchaseResponseDTO convertToResponseDTO(Purchase purchase) {
        PurchaseResponseDTO dto = new PurchaseResponseDTO();
        dto.setId(purchase.getId());
        dto.setDate(purchase.getDate());
        dto.setTotal(purchase.getTotal());
        // Assuming SupplierResponseDTO and ProductResponseDTO exist
        if (purchase.getSupplier() != null) {
            dto.setSupplier(new SupplierResponseDTO(purchase.getSupplier()));
        }
        dto.setItems(purchase.getItems().stream().map(item -> {
            PurchaseItemResponseDTO itemDTO = new PurchaseItemResponseDTO();
            itemDTO.setId(item.getId());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setUnitPrice(item.getUnitPrice());
            if (item.getProduct() != null) {
                itemDTO.setProduct(new ProductResponseDTO(item.getProduct()));
            }
            return itemDTO;
        }).collect(Collectors.toList()));
        return dto;
    }
}

