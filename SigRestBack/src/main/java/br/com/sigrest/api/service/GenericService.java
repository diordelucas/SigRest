package br.com.sigrest.api.service;

import java.util.List;

public interface GenericService <T, ID>{
    T save (T entity);
    T findById (ID id);
    List<T> getAll();
    void delete(ID id);
}
