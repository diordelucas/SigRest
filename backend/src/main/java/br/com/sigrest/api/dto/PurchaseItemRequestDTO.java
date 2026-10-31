package br.com.sigrest.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseItemRequestDTO {
    @NotNull(message = "selecione o produto")
    private Long productId;

    @NotNull(message = "informe a quantidade")
    @DecimalMin(value = "0.01", message = "a quantidade deve ser maior que zero")
    private BigDecimal quantity;

    @NotNull(message = "informe o preço unitário")
    @DecimalMin(value = "0.0", message = "o preço unitário não pode ser negativo")
    private BigDecimal unitPrice;
}
