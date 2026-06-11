package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Supplier;

public record SupplierResponseDTO(Long id, String name, String phone, String email, String registration, String cnpj) {
    public SupplierResponseDTO(Supplier supplier){
        this(supplier.getId(), supplier.getName(), supplier.getPhone(), supplier.getEmail(), supplier.getCnpj(), supplier.getRegistration());;
    }
}

