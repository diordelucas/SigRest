package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.ProductionOrderRequestDTO;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductionOrder;
import br.com.sigrest.api.entity.TechnicalSheet;
import br.com.sigrest.api.entity.TechnicalSheetItem;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.ProductionOrderRepository;
import br.com.sigrest.api.repository.TechnicalSheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductionOrderService {

    @Autowired
    private ProductionOrderRepository repository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TechnicalSheetRepository technicalSheetRepository;

    @Autowired
    private StockMovementService stockMovementService;

    public List<ProductionOrder> findAll() {
        return repository.findAll();
    }

    public ProductionOrder findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Ordem de Produção não encontrada"));
    }

    @Transactional
    public ProductionOrder save(ProductionOrderRequestDTO dto) {
        ProductionOrder order = new ProductionOrder();
        if (dto.id() != null) {
            order = findById(dto.id());
        } else {
            order.setDate(LocalDateTime.now());
            order.setStatus(ProductionOrder.Status.OPEN);
        }

        Product finalProduct = productRepository.findById(dto.finalProductId())
                .orElseThrow(() -> new RuntimeException("Produto final não encontrado"));

        order.setFinalProduct(finalProduct);
        order.setQuantity(dto.quantity());
        order.setNotes(dto.notes());

        return repository.save(order);
    }

    @Transactional
    public ProductionOrder finishProduction(Long id) {
        ProductionOrder order = findById(id);
        
        if (order.getStatus() == ProductionOrder.Status.FINISHED) {
            throw new RuntimeException("Ordem de produção já foi finalizada.");
        }
        if (order.getStatus() == ProductionOrder.Status.CANCELLED) {
            throw new RuntimeException("Ordem de produção está cancelada.");
        }

        Product finalProduct = order.getFinalProduct();
        if (finalProduct == null) {
            throw new RuntimeException("Produto final não associado à Ordem de Produção.");
        }

        TechnicalSheet sheet = technicalSheetRepository.findByFinalProductId(finalProduct.getId())
                .orElseThrow(() -> new RuntimeException("Ficha técnica não encontrada para o produto final: " + finalProduct.getName()));

        // 1. Validar se há estoque suficiente dos insumos antes de finalizar
        for (TechnicalSheetItem item : sheet.getItems()) {
            Product rawMaterial = item.getRawMaterial();
            BigDecimal totalNeededDecimal = item.getQuantity().multiply(BigDecimal.valueOf(order.getQuantity()));
            int totalUsed = totalNeededDecimal.setScale(0, RoundingMode.HALF_UP).intValue();
            
            int currentStorage = rawMaterial.getStorage() != null ? rawMaterial.getStorage() : 0;
            if (currentStorage < totalUsed) {
                throw new RuntimeException("Estoque insuficiente para o insumo: " + rawMaterial.getName() +
                        " (Necessário: " + totalUsed + ", Disponível: " + currentStorage + ")");
            }
        }
        
        // 2. Dar baixa nos insumos
        for (TechnicalSheetItem item : sheet.getItems()) {
            Product rawMaterial = item.getRawMaterial();
            BigDecimal totalNeededDecimal = item.getQuantity().multiply(BigDecimal.valueOf(order.getQuantity()));
            int totalUsed = totalNeededDecimal.setScale(0, RoundingMode.HALF_UP).intValue();
            
            String desc = "Consumo OP #" + order.getId() + " - " + sheet.getName();
            stockMovementService.createStockExit(rawMaterial, totalUsed, desc);
        }

        // 3. Dar entrada no produto acabado
        String entryDesc = "Produção OP #" + order.getId() + " - " + sheet.getName();
        stockMovementService.createStockEntry(finalProduct, order.getQuantity(), entryDesc);

        order.setStatus(ProductionOrder.Status.FINISHED);
        return repository.save(order);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
