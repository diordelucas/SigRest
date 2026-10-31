package br.com.sigrest.api.entity;

import br.com.sigrest.api.dto.SaleRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity(name = "sale")
@Table(name = "sale")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date date;
    private BigDecimal total;
    private BigDecimal discount;
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status = SaleStatus.COMPLETED;

    /** Soma do que já foi devolvido em estornos. O que a venda rendeu de fato é total - reversedAmount. */
    @Column(nullable = false)
    private BigDecimal reversedAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<SaleReversal> reversals = new ArrayList<>();

    /** Caixa aberto no momento da venda. É ele que recebe o valor das vendas em dinheiro. */
    @ManyToOne
    @JoinColumn(name = "cash_register_id")
    private CashRegister cashRegister;

    @ManyToOne
    @JoinColumn(name = "person_id")
    private Person person;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SellItem> items = new ArrayList<>();

    /**
     * Chave de idempotência gerada pelo frontend por envio de formulário: reenvio da mesma
     * venda (duplo clique, retry de rede) devolve o registro já criado em vez de duplicar
     * (ver PLANO_ACAO_COMPLETO.md, item 8).
     */
    @Column(unique = true)
    private String idempotencyKey;

    public Sale(SaleRequestDTO data){
        this.date = data.date();
        this.total = data.total();
        this.discount = data.discount();
        this.paymentMethod = data.paymentMethod();
        this.idempotencyKey = data.idempotencyKey();
    }

    /** Valor que a venda rendeu depois dos estornos: é o que conta no faturamento. */
    public BigDecimal getNetTotal() {
        BigDecimal bruto = total != null ? total : BigDecimal.ZERO;
        return bruto.subtract(reversedAmount != null ? reversedAmount : BigDecimal.ZERO);
    }
}

