package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;

/** Quantidade de um item da venda devolvida em um estorno. */
@Entity
@Table(name = "sale_reversal_item")
@Data
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"reversal", "sellItem"})
public class SaleReversalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reversal_id")
    private SaleReversal reversal;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sell_item_id")
    private SellItem sellItem;

    @Column(nullable = false)
    private BigDecimal quantity;
}
