package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.math.BigDecimal;

@Entity
@Table(name = "technical_sheet_item")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TechnicalSheetItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "technical_sheet_id")
    @JsonBackReference
    private TechnicalSheet technicalSheet;

    @ManyToOne
    @JoinColumn(name = "raw_material_id")
    private Product rawMaterial;

    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    private UnitOfMeasure unit;
}

