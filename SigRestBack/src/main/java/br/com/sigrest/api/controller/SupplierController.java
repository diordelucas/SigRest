package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.SupplierRequestDTO;
import br.com.sigrest.api.dto.SupplierResponseDTO;
import br.com.sigrest.api.entity.Supplier;
import br.com.sigrest.api.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("supplier")
public class SupplierController {

    @Autowired
    private SupplierRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveSupplier(@RequestBody SupplierRequestDTO data){
        Supplier supplierData = new Supplier(data);
        repository.save(supplierData);
        return;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<SupplierResponseDTO> getAll(){

        List<SupplierResponseDTO> supplierList = repository.findAll().stream().map(SupplierResponseDTO::new).toList();
            return supplierList;
        }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public SupplierResponseDTO getSupplierById(@PathVariable Long id){
        Supplier supplier = repository.findById(id).orElseThrow(() -> new RuntimeException("Fornecedor nÃ£o encontrada"));
        return new SupplierResponseDTO(supplier);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public SupplierResponseDTO updateSupplier(@PathVariable Long id, @RequestBody SupplierRequestDTO data) {
        Supplier supplier = repository.findById(id).orElseThrow(() -> new RuntimeException("Product nÃ£o encontrada"));
        supplier.setName(data.name());
        supplier.setCnpj(data.cnpj());
        supplier.setRegistration(data.registration());
        supplier.setPhone(data.phone());
        supplier.setEmail(data.email());

        Supplier updatedSupplier = repository.save(supplier);

        return new SupplierResponseDTO(updatedSupplier);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deleteSupplier(@PathVariable Long id) {
        repository.deleteById(id);
    }
    }

