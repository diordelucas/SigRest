package br.com.sigrest.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccountReceivableRequestDTO {
    private String description;
    private BigDecimal amount;
    private LocalDate dueDate;
    private Long personId;
}
