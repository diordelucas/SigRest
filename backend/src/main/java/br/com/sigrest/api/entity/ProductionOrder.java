package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_order")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductionOrder {

    public enum Status {
        OPEN,
        FINISHED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "final_product_id")
    private Product finalProduct;

    @Column(precision = 38, scale = 3)
    private BigDecimal quantity;

    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String notes;

    /** Quantidade que realmente saiu boa, preenchida ao finalizar. Nulo enquanto OPEN/CANCELLED. */
    @Column(precision = 38, scale = 3)
    private BigDecimal actualQuantity;

    /** Motivo da quebra, preenchido apenas quando actualQuantity < quantity. Opcional em produto pesado. */
    @Enumerated(EnumType.STRING)
    private LossReason lossReason;
}

