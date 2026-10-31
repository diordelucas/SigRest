package br.com.sigrest.api.entity;

import java.math.BigDecimal;

/**
 * Como o produto final é vendido: por unidade (marmita, bandeja de peso fixo) ou por quilo, pesado
 * na hora (encomenda feita na forma do próprio cliente). O estoque do produto fica nessa mesma unidade.
 */
public enum SaleUnit {

    UN("un", 0),
    KG("kg", 3);

    private final String label;
    private final int decimalPlaces;

    SaleUnit(String label, int decimalPlaces) {
        this.label = label;
        this.decimalPlaces = decimalPlaces;
    }

    public String getLabel() { return label; }

    /** Por unidade só aceita número inteiro; por quilo, até o grama. */
    public boolean accepts(BigDecimal quantity) {
        return quantity.stripTrailingZeros().scale() <= decimalPlaces;
    }
}
