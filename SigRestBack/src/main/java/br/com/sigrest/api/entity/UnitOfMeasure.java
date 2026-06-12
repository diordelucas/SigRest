package br.com.sigrest.api.entity;

import java.math.BigDecimal;

public enum UnitOfMeasure {

    G("grama", new BigDecimal("1"), "g"),
    KG("quilograma", new BigDecimal("1000"), "g"),
    ML("mililitro", new BigDecimal("1"), "ml"),
    L("litro", new BigDecimal("1000"), "ml"),
    UN("unidade", new BigDecimal("1"), "un"),
    DUZIA("dúzia", new BigDecimal("12"), "un");

    private final String label;
    private final BigDecimal conversionFactor;
    private final String baseUnitLabel;

    UnitOfMeasure(String label, BigDecimal conversionFactor, String baseUnitLabel) {
        this.label = label;
        this.conversionFactor = conversionFactor;
        this.baseUnitLabel = baseUnitLabel;
    }

    public String getLabel() { return label; }
    public BigDecimal getConversionFactor() { return conversionFactor; }
    public String getBaseUnitLabel() { return baseUnitLabel; }
}