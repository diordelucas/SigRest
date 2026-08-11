package br.com.sigrest.api.entity;

import br.com.sigrest.api.dto.CategoryRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity(name = "category")
@Table(name = "category")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Category implements SoftDeletable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    public Category(CategoryRequestDTO data) {
        this.name = data.name();
        this.description = data.description();
    }
}

