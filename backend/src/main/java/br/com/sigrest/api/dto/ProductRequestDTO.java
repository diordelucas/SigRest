package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductType;
import br.com.sigrest.api.entity.SaleUnit;
import br.com.sigrest.api.entity.UnitOfMeasure;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequestDTO(
        Long id,
        @NotBlank(message = "informe o nome do produto") String name,
        String code,
        @NotNull(message = "informe o preço de custo") @DecimalMin(value = "0.0", message = "o preço de custo não pode ser negativo") BigDecimal price,
        @DecimalMin(value = "0.0", message = "o preço de venda não pode ser negativo") BigDecimal sellPrice,
        @DecimalMin(value = "0.0", message = "o estoque atual não pode ser negativo") BigDecimal storage,
        @DecimalMin(value = "0.0", message = "o estoque mínimo não pode ser negativo") BigDecimal minStorage,
        @NotNull(message = "selecione uma categoria") Long categoryId,
        @NotNull(message = "selecione o tipo do produto") ProductType tipo,
        UnitOfMeasure purchaseUnit,
        BigDecimal packageQuantity,
        SaleUnit saleUnit
) {
    public ProductRequestDTO(Product product) {
        this(product.getId(), product.getName(), product.getCode(),
                product.getPrice(), product.getSellPrice(),
                product.getStorage(), product.getMinStorage(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getTipo(),
                product.getPurchaseUnit(),
                product.getPackageQuantity(),
                product.getSaleUnit());
    }

    /** Só produto final escolhe a unidade de venda; sem escolha, vende por unidade. */
    public SaleUnit effectiveSaleUnit() {
        return tipo == ProductType.PRODUTO_FINAL && saleUnit != null ? saleUnit : SaleUnit.UN;
    }
}
