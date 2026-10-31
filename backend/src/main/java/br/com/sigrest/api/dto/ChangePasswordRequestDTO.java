package br.com.sigrest.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequestDTO(
        @NotBlank(message = "informe a senha atual") String currentPassword,
        @NotBlank(message = "informe a nova senha") @Size(min = 6, message = "a nova senha deve ter ao menos 6 caracteres") String newPassword
) {
}
