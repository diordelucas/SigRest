package br.com.sigrest.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CashRegisterRequestDTO {
    private LocalDateTime openingTime;
    private BigDecimal openingBalance;
    private Long openedByUserId;
}
