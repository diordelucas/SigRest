package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Um estorno de venda, total ou parcial. Uma venda pode ter vários, até devolver todos os itens. */
@Entity
@Table(name = "sale_reversal")
@Data
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"sale", "items"})
public class SaleReversal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private String reason;

    /** Valor devolvido ao cliente neste estorno, já com a parte proporcional do desconto. */
    @Column(nullable = false)
    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "reversal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleReversalItem> items = new ArrayList<>();
}
