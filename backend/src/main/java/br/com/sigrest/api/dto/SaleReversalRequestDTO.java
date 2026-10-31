package br.com.sigrest.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SaleReversalRequestDTO(
        @NotBlank(message = "informe o motivo do estorno")
        @Size(max = 255, message = "o motivo do estorno deve ter até 255 caracteres") String reason,
        /** Itens e quantidades a devolver. Vazio estorna tudo o que ainda não foi estornado. */
        @Valid List<SaleReversalItemRequestDTO> items
) {
}
