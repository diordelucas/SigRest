package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Address;
import br.com.sigrest.api.entity.City;

public record AddressResponseDTO(Long id, String street, String number, String nbhd, City city) {
    public AddressResponseDTO(Address address){
        this(address.getId(), address.getStreet(), address.getNumber(), address.getNbhd(), address.getCity());
    }
}

