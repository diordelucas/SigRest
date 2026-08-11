package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.ProductionOrderRequestDTO;
import br.com.sigrest.api.dto.ProductionOrderResponseDTO;
import br.com.sigrest.api.entity.ProductionOrder;
import br.com.sigrest.api.service.ProductionOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/production-order")
public class ProductionOrderController {

    @Autowired
    private ProductionOrderService service;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public ProductionOrderResponseDTO save(@RequestBody ProductionOrderRequestDTO data) {
        return new ProductionOrderResponseDTO(service.save(data));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<ProductionOrderResponseDTO> getAll() {
        return service.findAll().stream().map(ProductionOrderResponseDTO::new).toList();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public ProductionOrderResponseDTO getById(@PathVariable Long id) {
        return new ProductionOrderResponseDTO(service.findById(id));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public ProductionOrderResponseDTO update(@PathVariable Long id, @RequestBody ProductionOrderRequestDTO data) {
        ProductionOrderRequestDTO dto = new ProductionOrderRequestDTO(id, data.finalProductId(), data.quantity(), data.notes());
        return new ProductionOrderResponseDTO(service.save(dto));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/{id}/finish")
    public ProductionOrderResponseDTO finishProduction(@PathVariable Long id) {
        return new ProductionOrderResponseDTO(service.finishProduction(id));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
