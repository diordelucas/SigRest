package br.com.sigrest.api.entity;

import br.com.sigrest.api.dto.ProductRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity(name = "product")
@Table(name = "product")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String code;
    private BigDecimal price;
    private BigDecimal sellPrice;
    private BigDecimal storage;
    private BigDecimal minStorage;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    private ProductType tipo;

    @Enumerated(EnumType.STRING)
    private UnitOfMeasure purchaseUnit;

    private BigDecimal packageQuantity;

    public Product(ProductRequestDTO data){
        this.name = data.name();
        this.code = data.code();
        this.price = data.price();
        this.sellPrice = data.sellPrice();
        this.storage = data.storage();
        this.minStorage = data.minStorage();
        this.tipo = data.tipo();
        this.purchaseUnit = data.purchaseUnit();
        this.packageQuantity = data.packageQuantity();
        if (data.categoryId() != null) {
            this.category = new Category();
            this.category.setId(data.categoryId());
        }
    }
}

