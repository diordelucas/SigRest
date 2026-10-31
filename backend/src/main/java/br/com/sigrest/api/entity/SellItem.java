package br.com.sigrest.api.entity;

import br.com.sigrest.api.dto.SellItemRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Data
@Entity(name = "sell_item")
@Table(name = "sell_item")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class SellItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal unitPrice;
    @Column(precision = 38, scale = 3)
    private BigDecimal quantity;

    /** Quantidade já devolvida em estornos desta venda. */
    @Column(nullable = false, precision = 38, scale = 3)
    private BigDecimal reversedQuantity = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    public SellItem(SellItemRequestDTO data){
        this.unitPrice = data.unitPrice();
        this.quantity = data.quantity();
    }

    /** Quantidade que continua vendida, descontados os estornos. */
    public BigDecimal getNetQuantity() {
        return quantity.subtract(reversedQuantity != null ? reversedQuantity : BigDecimal.ZERO);
    }

    /** Valor do item, em centavos exatos: 1,355 kg a R$ 39,90 dá R$ 54,06. */
    public BigDecimal getSubtotal() {
        return unitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP);
    }

    /** Valor do que continua vendido, descontados os estornos. */
    public BigDecimal getNetSubtotal() {
        return unitPrice.multiply(getNetQuantity()).setScale(2, RoundingMode.HALF_UP);
    }

}

