package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.SellItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SellItemRepository extends JpaRepository<SellItem, Long> {
}

