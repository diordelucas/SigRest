package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.State;

public record StateResponseDTO(Long id, String name, String uf) {
    public StateResponseDTO(State state){
        this(state.getId(), state.getName(), state.getUf());
    }
}

