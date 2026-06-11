package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.AccountPayable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountPayableRepository extends JpaRepository<AccountPayable, Long> {
}

