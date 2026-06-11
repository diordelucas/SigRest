package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM product p WHERE p.storage <= p.minStorage")
    List<Product> findLowStockProducts();
}

