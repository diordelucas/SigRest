package br.com.sigrest.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Edição de usuário pelo administrador. Senha em branco mantém a atual. */
public record UserUpdateRequestDTO(
        @NotBlank(message = "informe o nome") String name,
        @NotBlank(message = "informe o e-mail") @Email(message = "e-mail inválido") String email,
        @Size(min = 6, message = "a senha deve ter ao menos 6 caracteres") String password,
        @NotBlank(message = "informe o perfil") @Pattern(regexp = "ADMIN|OPERADOR", message = "perfil inválido") String role
) {
}
