package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StateRepository extends JpaRepository<State, Long> {
}

