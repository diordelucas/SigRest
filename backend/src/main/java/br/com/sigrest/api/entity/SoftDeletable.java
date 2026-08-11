package br.com.sigrest.api.entity;

/**
 * Entidades de cadastro cujo "excluir" e sempre desativacao, nunca remocao
 * fisica: perder a linha quebraria o historico de vendas, compras e fichas
 * tecnicas que apontam para ela.
 */
public interface SoftDeletable {
    boolean isActive();
    void setActive(boolean active);
}
