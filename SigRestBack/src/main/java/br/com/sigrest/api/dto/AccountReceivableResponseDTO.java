package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.AccountReceivable;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccountReceivableResponseDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate dueDate;
    private LocalDate receiptDate;
    private AccountReceivable.Status status;
    private PersonResponseDTO person;
}

