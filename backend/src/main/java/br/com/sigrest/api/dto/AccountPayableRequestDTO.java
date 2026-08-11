package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.AccountPayable;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccountPayableRequestDTO {
    private String description;
    private BigDecimal amount;
    private LocalDate dueDate;
    private Long supplierId;
}

