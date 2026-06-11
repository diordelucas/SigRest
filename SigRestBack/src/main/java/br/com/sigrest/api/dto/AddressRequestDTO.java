package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Address;
import br.com.sigrest.api.entity.City;

public record AddressRequestDTO(Long id, String street, String number, String nbhd, City city) {
    public AddressRequestDTO(Address address){
        this(address.getId(), address.getStreet(), address.getNumber(), address.getNbhd(), address.getCity());
    }
}

