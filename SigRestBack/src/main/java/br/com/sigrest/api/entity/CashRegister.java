package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_register")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CashRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDateTime openingTime;
    private LocalDateTime closingTime;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;

    @ManyToOne
    @JoinColumn(name = "opened_by_user_id")
    private User openedBy;

    @ManyToOne
    @JoinColumn(name = "closed_by_user_id")
    private User closedBy;

    private boolean isOpen;
}

