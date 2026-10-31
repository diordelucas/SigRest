package br.com.sigrest.api.entity;

/**
 * Situação da venda. {@link #PARTIALLY_REVERSED} conta no faturamento só pelo que sobrou depois dos
 * estornos; {@link #REVERSED} sai do faturamento e dos relatórios, mas continua no histórico.
 */
public enum SaleStatus {
    COMPLETED,
    PARTIALLY_REVERSED,
    REVERSED
}
