package br.com.sigrest.api.entity;

import br.com.sigrest.api.dto.SupplierRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity(name = "supplier")
@Table(name = "supplier")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String phone;
    private String registration;
    private String cnpj;
    private String email;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    private Address address;

    public Supplier(SupplierRequestDTO data){
        this.name = data.name();
        this.phone = data.phone();
        this.registration = data.registration();
        this.cnpj = data.cnpj();
        this.email = data.email();

    }
}

