package br.com.sigrest.api.dto;

import br.com.sigrest.api.entity.AccountPayable;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccountPayableResponseDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate dueDate;
    private LocalDate paymentDate;
    private AccountPayable.Status status;
    private SupplierResponseDTO supplier;
}

