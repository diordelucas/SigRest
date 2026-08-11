package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "account_receivable")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AccountReceivable {

    public enum Status {
        PENDING,
        RECEIVED,
        OVERDUE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String description;
    private BigDecimal amount;
    private LocalDate dueDate;
    private LocalDate receiptDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "person_id")
    private Person person; // Cliente
}

