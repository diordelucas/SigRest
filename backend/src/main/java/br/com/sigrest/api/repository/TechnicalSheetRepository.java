package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.TechnicalSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TechnicalSheetRepository extends JpaRepository<TechnicalSheet, Long> {
    Optional<TechnicalSheet> findByFinalProductId(Long finalProductId);
}

