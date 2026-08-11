package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.City;
import br.com.sigrest.api.entity.State;

public record CityRequestDTO(Long id, String name, State state) {
    public CityRequestDTO(City city){
        this(city.getId(), city.getName(), city.getState());
    }
}

