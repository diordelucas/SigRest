package br.com.sigrest.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CashRegisterResponseDTO {
    private Long id;
    private LocalDateTime openingTime;
    private LocalDateTime closingTime;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal currentBalance;   // saldo final calculado
    private BigDecimal countedBalance;   // valor contado no fechamento (opcional)
    private BigDecimal difference;       // contado - saldo final (null se não houve contagem)
    private BigDecimal salesTotal;       // vendas em dinheiro deste caixa
    private BigDecimal otherPaymentsTotal; // vendas em PIX e cartão (informativo: não passam pelo caixa)
    private BigDecimal purchasesTotal;   // compras em dinheiro registradas com este caixa aberto
    private BigDecimal otherPurchasesTotal; // compras em PIX, cartão e boleto (informativo: não saem do caixa)
    private BigDecimal movementsTotal;   // soma líquida das movimentações manuais
    private UserResponseDTO openedBy;
    private UserResponseDTO closedBy;
    private boolean isOpen;
}
