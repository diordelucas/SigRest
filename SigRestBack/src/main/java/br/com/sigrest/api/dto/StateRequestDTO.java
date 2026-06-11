package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.State;

public record StateRequestDTO(Long id, String name, String uf) {
    public StateRequestDTO(State state){
        this(state.getId(), state.getName(), state.getUf());
    }
}

