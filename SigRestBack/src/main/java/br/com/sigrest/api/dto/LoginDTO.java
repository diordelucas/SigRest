package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.User;

public record LoginDTO(String email, String password) {
    public LoginDTO (User user){
        this(user.getEmail(), user.getPassword());
    }
}

