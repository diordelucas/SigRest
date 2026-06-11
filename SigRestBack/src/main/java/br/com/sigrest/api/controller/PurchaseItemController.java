package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.PurchaseItemRequestDTO;
import br.com.sigrest.api.dto.PurchaseItemResponseDTO;
import br.com.sigrest.api.entity.PurchaseItem;
import br.com.sigrest.api.repository.PurchaseItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("purchase_item")
public class PurchaseItemController {

    @Autowired
    private PurchaseItemRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void savePurchaseItem(@RequestBody PurchaseItemRequestDTO data){
        PurchaseItem purchaseItemData = new PurchaseItem();
        purchaseItemData.setQuantity(data.getQuantity());
        purchaseItemData.setUnitPrice(data.getUnitPrice());
        repository.save(purchaseItemData);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<PurchaseItemResponseDTO> getAll(){
        return repository.findAll().stream().map(purchaseItem -> {
            PurchaseItemResponseDTO dto = new PurchaseItemResponseDTO();
            dto.setId(purchaseItem.getId());
            dto.setQuantity(purchaseItem.getQuantity());
            dto.setUnitPrice(purchaseItem.getUnitPrice());
            return dto;
        }).toList();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public PurchaseItemResponseDTO getPurchaseItemById(@PathVariable Long id){
        PurchaseItem purchaseItem = repository.findById(id).orElseThrow(() -> new RuntimeException("Item de Compra nÃ£o encontrado"));
        PurchaseItemResponseDTO dto = new PurchaseItemResponseDTO();
        dto.setId(purchaseItem.getId());
        dto.setQuantity(purchaseItem.getQuantity());
        dto.setUnitPrice(purchaseItem.getUnitPrice());
        return dto;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deletePurchaseItem(@PathVariable Long id) {
        repository.deleteById(id);
    }
}

