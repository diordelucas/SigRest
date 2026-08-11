package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.User;

public record UserRequestDTO(String name, String email, String password, String role) {
}

