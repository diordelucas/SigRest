package br.com.sigrest.api.entity;

/** Situação da venda: {@link #REVERSED} sai do faturamento e dos relatórios, mas continua no histórico. */
public enum SaleStatus {
    COMPLETED,
    REVERSED
}
