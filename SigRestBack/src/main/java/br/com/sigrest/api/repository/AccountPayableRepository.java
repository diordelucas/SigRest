package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.AccountPayable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface AccountPayableRepository extends JpaRepository<AccountPayable, Long> {

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM AccountPayable a WHERE a.status = 'PENDING'")
    BigDecimal sumPending();
}

