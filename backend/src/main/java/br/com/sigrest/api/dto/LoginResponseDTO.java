package br.com.sigrest.api.dto;

public record LoginResponseDTO(String token, String name, String email, String role) {
}
