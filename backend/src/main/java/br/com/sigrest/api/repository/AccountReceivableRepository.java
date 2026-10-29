package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.AccountReceivable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccountReceivableRepository extends JpaRepository<AccountReceivable, Long> {

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM AccountReceivable a WHERE a.status = 'PENDING'")
    BigDecimal sumPending();

    /** Contas com vencimento no intervalo, da mais antiga para a mais nova. */
    List<AccountReceivable> findByDueDateBetweenOrderByDueDateAsc(LocalDate start, LocalDate end);
}
