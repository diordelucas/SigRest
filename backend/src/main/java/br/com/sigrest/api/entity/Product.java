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
public class Product implements SoftDeletable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String code;
    private BigDecimal price;
    private BigDecimal sellPrice;
    @Column(precision = 38, scale = 3)
    private BigDecimal storage;
    @Column(precision = 38, scale = 3)
    private BigDecimal minStorage;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    private ProductType tipo;

    @Enumerated(EnumType.STRING)
    private UnitOfMeasure purchaseUnit;

    private BigDecimal packageQuantity;

    /** Só vale para produto final; os demais têm a unidade de compra. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleUnit saleUnit = SaleUnit.UN;

    @Column(nullable = false)
    private boolean active = true;

    /**
     * Lock otimista: evita que duas vendas/compras simultâneas leiam o mesmo estoque,
     * subtraiam/somem em paralelo e uma sobrescreva a outra (ver StockMovementService).
     * A segunda transação a tentar salvar recebe {@link jakarta.persistence.OptimisticLockException}.
     */
    @Version
    private Long version;

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
        this.saleUnit = data.effectiveSaleUnit();
        if (data.categoryId() != null) {
            this.category = new Category();
            this.category.setId(data.categoryId());
        }
    }

    /** Unidade em que o estoque é guardado: produto final na unidade de venda, os demais na unidade base. */
    public String getStockUnit() {
        if (tipo == ProductType.PRODUTO_FINAL) {
            return saleUnit.getLabel();
        }
        return purchaseUnit != null ? purchaseUnit.getBaseUnitLabel() : "un";
    }

    /** Não existe 1,5 marmita: produto final por unidade só movimenta quantidade inteira. */
    public boolean acceptsQuantity(BigDecimal quantity) {
        return tipo != ProductType.PRODUTO_FINAL || saleUnit.accepts(quantity);
    }
}

