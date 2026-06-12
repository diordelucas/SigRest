package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "technical_sheet")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TechnicalSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "final_product_id")
    private Product finalProduct;

    @OneToMany(mappedBy = "technicalSheet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<TechnicalSheetItem> items;

    private Integer rendimento;
    private BigDecimal labourCostPercent;
    private BigDecimal variableExpensesPercent;
    private BigDecimal desiredMarginPercent;
}

