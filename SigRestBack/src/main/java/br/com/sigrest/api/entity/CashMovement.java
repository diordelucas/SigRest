package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_movement")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CashMovement {

    public enum MovementType {
        INCOME,
        EXPENSE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cash_register_id")
    private CashRegister cashRegister;

    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private MovementType type;

    private BigDecimal amount;

    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

