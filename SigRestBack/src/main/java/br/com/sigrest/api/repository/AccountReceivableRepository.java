package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.AccountReceivable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountReceivableRepository extends JpaRepository<AccountReceivable, Long> {
}

