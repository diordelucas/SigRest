package br.com.sigrest.api.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Linha do relatório de contas a pagar/receber. {@code status} é o status efetivo na data do
 * relatório: uma conta PENDING com vencimento já passado sai como OVERDUE, mesmo que o registro
 * no banco ainda não tenha sido atualizado.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountReportRowDTO {
    private Long accountId;
    private String description;
    /** Fornecedor (contas a pagar) ou cliente (contas a receber). */
    private String partyName;
    private LocalDate dueDate;
    /** Data de pagamento/recebimento, quando liquidada. */
    private LocalDate settlementDate;
    private BigDecimal amount;
    private String status;
    private long daysOverdue;
}
