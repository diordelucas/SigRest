package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.LossReason;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockLossRequestDTO {
    @NotNull(message = "selecione o produto")
    private Long productId;

    @NotNull(message = "informe a quantidade")
    @DecimalMin(value = "0.001", message = "a quantidade deve ser maior que zero")
    private BigDecimal quantity;

    @NotNull(message = "informe o motivo da perda")
    private LossReason reason;

    private String description;
}
