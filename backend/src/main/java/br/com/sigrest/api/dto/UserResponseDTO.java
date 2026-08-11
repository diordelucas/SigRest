package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.User;

public record UserResponseDTO(Long id, String name, String email, String role) {
    public UserResponseDTO(User user){
        this(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}

