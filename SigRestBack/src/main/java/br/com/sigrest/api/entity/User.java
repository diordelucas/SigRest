package br.com.sigrest.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity(name = "user")
@Table(name = "app_user")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String email;
    private String password;
    private String name;
    private String role; // e.g., ADMIN, OPERADOR
}

