package br.com.sigrest.api.service;

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

    @Override
    public List<T> getAll(){
        return getRepository().findAll();
    }

    @Override
    public void delete(ID id){
        getRepository().deleteById(id);
    }
}
