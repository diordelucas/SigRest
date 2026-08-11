package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Supplier;

public record SupplierResponseDTO(
        Long id,
        String name,
        String phone,
        String email,
        String registration,
        String cnpj,
        String street,
        String number,
        String nbhd,
        String city,
        String uf
) {
    public SupplierResponseDTO(Supplier supplier) {
        this(
                supplier.getId(),
                supplier.getName(),
                supplier.getPhone(),
                supplier.getEmail(),
                supplier.getRegistration(),
                supplier.getCnpj(),
                supplier.getAddress() != null ? supplier.getAddress().getStreet() : null,
                supplier.getAddress() != null ? supplier.getAddress().getNumber() : null,
                supplier.getAddress() != null ? supplier.getAddress().getNbhd() : null,
                supplier.getAddress() != null && supplier.getAddress().getCity() != null
                        ? supplier.getAddress().getCity().getName() : null,
                supplier.getAddress() != null && supplier.getAddress().getCity() != null
                        && supplier.getAddress().getCity().getState() != null
                        ? supplier.getAddress().getCity().getState().getUf() : null
        );
    }
}