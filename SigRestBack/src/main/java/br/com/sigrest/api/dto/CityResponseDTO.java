package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.City;
import br.com.sigrest.api.entity.State;

public record CityResponseDTO(Long id, String name, State state) {
    public CityResponseDTO(City city){
        this(city.getId(), city.getName(), city.getState());
    }
}

