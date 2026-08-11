package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.SellItemRequestDTO;
import br.com.sigrest.api.dto.SellItemResponseDTO;
import br.com.sigrest.api.entity.SellItem;
import br.com.sigrest.api.repository.SellItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("sell_item")
public class SellItemController {

    @Autowired
    private SellItemRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveSellItem(@RequestBody SellItemRequestDTO data){
        SellItem sellItemData = new SellItem(data);
        repository.save(sellItemData);
        return;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<SellItemResponseDTO> getAll(){

        List<SellItemResponseDTO> sellItemList = repository.findAll().stream().map(SellItemResponseDTO::new).toList();
            return sellItemList;
        }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public SellItemResponseDTO getSellItemById(@PathVariable Long id){
        SellItem sellItem = repository.findById(id).orElseThrow(() -> new RuntimeException("Itens nÃ£o encontrados"));
        return new SellItemResponseDTO(sellItem);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public SellItemResponseDTO updateSellItem(@PathVariable Long id, @RequestBody SellItemRequestDTO data) {
        SellItem sellItem = repository.findById(id).orElseThrow(() -> new RuntimeException("Itens nÃ£o encontrados"));
        sellItem.setQuantity(data.quantity());
        sellItem.setUnitPrice(data.unitPrice());

        return new SellItemResponseDTO(sellItem);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deleteSellItem(@PathVariable Long id) {
        repository.deleteById(id);
    }

    }

