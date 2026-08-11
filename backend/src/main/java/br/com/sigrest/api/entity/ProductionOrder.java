package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

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

    private Integer quantity;

    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String notes;
}

