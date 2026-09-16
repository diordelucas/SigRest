package br.com.sigrest.api.entity;

/**
 * Motivo de uma quebra — seja na baixa de estoque (produto/insumo descartado)
 * ou no rendimento de uma ordem de produção (saiu menos do que o planejado).
 */
public enum LossReason {
    VENCIMENTO,
    ERRO_PREPARO,
    DESCARTE_QUALIDADE,
    OUTRO
}
