package br.com.sigrest.api.exception;

import org.springframework.http.HttpStatus;

/**
 * Catálogo central de erros do SIGREST. Cada valor é um erro de significado único — reutilizado
 * em todos os pontos do código onde a mesma causa se repete (ex.: "produto não encontrado" usa
 * sempre {@link #PROD_NAO_ENCONTRADO}, não importa o endpoint que disparou).
 *
 * <p>O código (ex. {@code SIGREST-PROD-001}) é estável e não deve ser reaproveitado para outro
 * significado, mesmo que o erro original seja removido — times de suporte podem ter esse código
 * em histórico de atendimento.
 */
public enum ErrorCode {

    // Autenticação e sessão
    AUTH_CREDENCIAIS_INVALIDAS("SIGREST-AUTH-001", "E-mail ou senha inválidos.", HttpStatus.UNAUTHORIZED),
    AUTH_SESSAO_EXPIRADA("SIGREST-AUTH-002", "Sessão expirada ou ausente. Faça login novamente.", HttpStatus.UNAUTHORIZED),
    AUTH_PERMISSAO_INSUFICIENTE("SIGREST-AUTH-003", "Você não tem permissão para esta operação.", HttpStatus.FORBIDDEN),
    AUTH_MUITAS_TENTATIVAS("SIGREST-AUTH-004", "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.", HttpStatus.TOO_MANY_REQUESTS),

    // Usuários
    USER_NAO_ENCONTRADO("SIGREST-USER-001", "Usuário não encontrado.", HttpStatus.NOT_FOUND),
    USER_ULTIMO_ADMIN("SIGREST-USER-002", "Não é possível remover o último administrador do sistema.", HttpStatus.BAD_REQUEST),
    USER_EMAIL_DUPLICADO("SIGREST-USER-003", "Já existe um usuário com este e-mail.", HttpStatus.CONFLICT),
    USER_SENHA_ATUAL_INCORRETA("SIGREST-USER-004", "A senha atual está incorreta.", HttpStatus.BAD_REQUEST),
    USER_AUTOEXCLUSAO("SIGREST-USER-005", "Você não pode excluir o próprio usuário.", HttpStatus.BAD_REQUEST),

    // Produtos e categorias
    PROD_NAO_ENCONTRADO("SIGREST-PROD-001", "Produto não encontrado.", HttpStatus.NOT_FOUND),
    PROD_CATEGORIA_OBRIGATORIA("SIGREST-PROD-002", "Selecione uma categoria para o produto.", HttpStatus.BAD_REQUEST),
    PROD_CODIGO_DUPLICADO("SIGREST-PROD-003", "Já existe um produto com este código.", HttpStatus.CONFLICT),
    PROD_EM_USO_NA_FICHA("SIGREST-PROD-004", "Este produto é usado em uma ficha técnica e não pode ser excluído.", HttpStatus.CONFLICT),
    PROD_INSUMO_SEM_UNIDADE("SIGREST-PROD-005", "Informe a unidade de compra e a quantidade por embalagem do insumo.", HttpStatus.BAD_REQUEST),
    PROD_PRECO_VENDA_OBRIGATORIO("SIGREST-PROD-006", "Informe o preço de venda do produto final.", HttpStatus.BAD_REQUEST),
    CAT_NAO_ENCONTRADA("SIGREST-CAT-001", "Categoria não encontrada.", HttpStatus.NOT_FOUND),
    CAT_NOME_DUPLICADO("SIGREST-CAT-002", "Já existe uma categoria com este nome.", HttpStatus.CONFLICT),
    CAT_EM_USO("SIGREST-CAT-003", "Esta categoria tem produtos ativos e não pode ser excluída.", HttpStatus.CONFLICT),

    // Pessoas (clientes) e fornecedores
    PERSON_NAO_ENCONTRADA("SIGREST-PERSON-001", "Cliente não encontrado.", HttpStatus.NOT_FOUND),
    PERSON_CPF_INVALIDO("SIGREST-PERSON-002", "CPF inválido.", HttpStatus.BAD_REQUEST),
    SUPP_NAO_ENCONTRADO("SIGREST-SUPP-001", "Fornecedor não encontrado.", HttpStatus.NOT_FOUND),
    SUPP_CNPJ_INVALIDO("SIGREST-SUPP-002", "CNPJ inválido.", HttpStatus.BAD_REQUEST),

    // Endereço, cidade e estado
    ADDRESS_NAO_ENCONTRADO("SIGREST-GEO-001", "Endereço não encontrado.", HttpStatus.NOT_FOUND),
    CITY_NAO_ENCONTRADA("SIGREST-GEO-002", "Cidade não encontrada.", HttpStatus.NOT_FOUND),
    STATE_NAO_ENCONTRADO("SIGREST-GEO-003", "Estado não encontrado.", HttpStatus.NOT_FOUND),
    GEO_UF_INVALIDA("SIGREST-GEO-004", "UF inválida. Informe a sigla de um estado brasileiro.", HttpStatus.BAD_REQUEST),

    // Vendas e itens
    SALE_NAO_ENCONTRADA("SIGREST-SALE-001", "Venda não encontrada.", HttpStatus.NOT_FOUND),
    SALE_DESCONTO_INVALIDO("SIGREST-SALE-002", "O desconto não pode ser maior que o subtotal da venda.", HttpStatus.BAD_REQUEST),
    SALE_PRODUTO_NAO_VENDAVEL("SIGREST-SALE-003", "Só produtos finais podem ser vendidos.", HttpStatus.BAD_REQUEST),
    SALE_JA_ESTORNADA("SIGREST-SALE-004", "Esta venda já foi estornada.", HttpStatus.BAD_REQUEST),
    ITEM_VENDA_NAO_ENCONTRADO("SIGREST-ITEM-001", "Item de venda não encontrado.", HttpStatus.NOT_FOUND),

    // Compras e itens
    PURCH_NAO_ENCONTRADA("SIGREST-PURCH-001", "Compra não encontrada.", HttpStatus.NOT_FOUND),
    ITEM_COMPRA_NAO_ENCONTRADO("SIGREST-ITEM-002", "Item de compra não encontrado.", HttpStatus.NOT_FOUND),

    // Estoque
    STOCK_INSUFICIENTE("SIGREST-STOCK-001", "Estoque insuficiente para concluir esta operação.", HttpStatus.BAD_REQUEST),
    STOCK_MOVIMENTO_NAO_ENCONTRADO("SIGREST-STOCK-002", "Movimentação de estoque não encontrada.", HttpStatus.NOT_FOUND),
    STOCK_CONFLITO_CONCORRENCIA("SIGREST-STOCK-003", "Este produto foi alterado por outra operação simultânea. Tente novamente.", HttpStatus.CONFLICT),

    // Ficha técnica
    TECH_FICHA_NAO_ENCONTRADA("SIGREST-TECH-001", "Ficha técnica não encontrada.", HttpStatus.NOT_FOUND),
    TECH_UNIDADE_INCOMPATIVEL("SIGREST-TECH-002", "A unidade do ingrediente é incompatível com a unidade de compra do insumo.", HttpStatus.BAD_REQUEST),
    TECH_PRODUTO_FINAL_INVALIDO("SIGREST-TECH-003", "Um insumo não pode ser o produto final de uma ficha técnica.", HttpStatus.BAD_REQUEST),

    // Ordens de produção
    PORD_NAO_ENCONTRADA("SIGREST-PORD-001", "Ordem de produção não encontrada.", HttpStatus.NOT_FOUND),
    PORD_JA_FINALIZADA("SIGREST-PORD-002", "Esta ordem de produção já foi finalizada.", HttpStatus.BAD_REQUEST),
    PORD_CANCELADA("SIGREST-PORD-003", "Esta ordem de produção foi cancelada.", HttpStatus.BAD_REQUEST),
    PORD_PRODUTO_NAO_ASSOCIADO("SIGREST-PORD-004", "Ordem de produção sem produto associado.", HttpStatus.CONFLICT),
    PORD_SEM_FICHA_TECNICA("SIGREST-PORD-005", "Este produto não tem ficha técnica cadastrada.", HttpStatus.BAD_REQUEST),
    PORD_MOTIVO_QUEBRA_OBRIGATORIO("SIGREST-PORD-006", "Informe o motivo da quebra quando a quantidade produzida for menor que a planejada.", HttpStatus.BAD_REQUEST),
    PORD_REAL_MAIOR_QUE_PLANEJADO("SIGREST-PORD-007", "A quantidade real não pode ser maior que a planejada. Se produziu a mais, abra outra ordem.", HttpStatus.BAD_REQUEST),

    // Caixa
    CASH_JA_ABERTO("SIGREST-CASH-001", "Já existe um caixa aberto.", HttpStatus.BAD_REQUEST),
    CASH_NAO_ENCONTRADO("SIGREST-CASH-002", "Caixa não encontrado.", HttpStatus.NOT_FOUND),
    CASH_NAO_ABERTO("SIGREST-CASH-003", "Este caixa não está aberto.", HttpStatus.BAD_REQUEST),

    // Contas a pagar
    PAY_NAO_ENCONTRADA("SIGREST-PAY-001", "Conta a pagar não encontrada.", HttpStatus.NOT_FOUND),
    PAY_JA_PAGA("SIGREST-PAY-002", "Esta conta já foi paga.", HttpStatus.BAD_REQUEST),
    PAY_NAO_PAGA("SIGREST-PAY-003", "Esta conta ainda não foi paga.", HttpStatus.BAD_REQUEST),

    // Contas a receber
    REC_NAO_ENCONTRADA("SIGREST-REC-001", "Conta a receber não encontrada.", HttpStatus.NOT_FOUND),
    REC_JA_RECEBIDA("SIGREST-REC-002", "Esta conta já foi recebida.", HttpStatus.BAD_REQUEST),
    REC_NAO_RECEBIDA("SIGREST-REC-003", "Esta conta ainda não foi recebida.", HttpStatus.BAD_REQUEST),

    // Relatórios
    REPORT_PERIODO_INVALIDO("SIGREST-REPORT-001", "A data inicial não pode ser posterior à data final.", HttpStatus.BAD_REQUEST),
    REPORT_GERACAO_FALHOU("SIGREST-REPORT-002", "Não foi possível gerar o relatório em PDF. Tente novamente.", HttpStatus.INTERNAL_SERVER_ERROR),

    // Genéricos / infraestrutura
    GEN_REQUISICAO_INVALIDA("SIGREST-GEN-001", "Requisição inválida. Confira os dados enviados.", HttpStatus.BAD_REQUEST),
    GEN_PARAMETRO_AUSENTE("SIGREST-GEN-002", "Parâmetro obrigatório ausente na requisição.", HttpStatus.BAD_REQUEST),
    GEN_VALIDACAO_FALHOU("SIGREST-GEN-003", "Dados inválidos. Confira os campos destacados.", HttpStatus.BAD_REQUEST),
    GEN_CONFLITO_DADOS("SIGREST-GEN-004", "Já existe um registro com esses dados.", HttpStatus.CONFLICT),
    GEN_TELEFONE_INVALIDO("SIGREST-GEN-005", "Telefone inválido. Informe o DDD e o número.", HttpStatus.BAD_REQUEST),
    GEN_CAMPO_MUITO_LONGO("SIGREST-GEN-006", "Um dos campos passou do tamanho máximo permitido.", HttpStatus.BAD_REQUEST),
    GEN_REGISTRO_EM_USO("SIGREST-GEN-007", "Este registro está em uso e não pode ser removido.", HttpStatus.CONFLICT),
    GEN_DADOS_NAO_SALVOS("SIGREST-GEN-008", "Não foi possível salvar estes dados. Confira os campos e tente novamente.", HttpStatus.BAD_REQUEST),
    GEN_ERRO_INTERNO("SIGREST-GEN-500", "Ocorreu um erro inesperado. Tente novamente em instantes.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String codigo;
    private final String mensagemPadrao;
    private final HttpStatus status;

    ErrorCode(String codigo, String mensagemPadrao, HttpStatus status) {
        this.codigo = codigo;
        this.mensagemPadrao = mensagemPadrao;
        this.status = status;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getMensagemPadrao() {
        return mensagemPadrao;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
