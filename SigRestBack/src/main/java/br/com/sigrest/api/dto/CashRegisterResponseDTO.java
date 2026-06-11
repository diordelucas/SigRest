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
    private UserResponseDTO openedBy;
    private UserResponseDTO closedBy;
    private boolean isOpen;
}
