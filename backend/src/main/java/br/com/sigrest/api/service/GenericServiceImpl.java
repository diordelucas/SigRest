package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.SoftDeletable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public abstract class GenericServiceImpl<T, ID> implements GenericService<T, ID> {

    protected abstract JpaRepository<T, ID> getRepository();

    @Override
    public T save(T entity){
        return getRepository().save(entity);
    }

    @Override
    public T findById(ID id){
        Optional<T> result = getRepository().findById(id);
        return result.orElse(null);
    }

    /** Entidades desativadas (soft delete) somem da listagem padrao, mas continuam no banco. */
    @Override
    public List<T> getAll(){
        return getRepository().findAll().stream()
                .filter(entity -> !(entity instanceof SoftDeletable softDeletable) || softDeletable.isActive())
                .toList();
    }

    /**
     * "Excluir" nunca remove fisicamente uma entidade que suporte soft delete —
     * so marca como inativa, preservando o historico de quem a referencia
     * (vendas, compras, fichas tecnicas). Entidades sem esse suporte continuam
     * sendo removidas de fato.
     */
    @Override
    public void delete(ID id){
        T entity = findById(id);
        if (entity instanceof SoftDeletable softDeletable) {
            softDeletable.setActive(false);
            getRepository().save(entity);
        } else {
            getRepository().deleteById(id);
        }
    }
}
