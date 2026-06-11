package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Supplier;

public record SupplierRequestDTO(Long id, String name, String phone, String registration, String cnpj, String email) {
    public SupplierRequestDTO(Supplier supplier){
        this(supplier.getId(), supplier.getName(), supplier.getPhone(), supplier.getRegistration(), supplier.getCnpj(), supplier.getEmail());
    }
}

