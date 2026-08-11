package br.com.sigrest.api.entity;

import br.com.sigrest.api.dto.SellItemRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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
    private BigDecimal quantity;

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

}

