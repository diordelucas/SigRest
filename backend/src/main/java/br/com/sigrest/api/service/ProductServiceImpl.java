package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;

public class ProductServiceImpl extends GenericServiceImpl<Product, Long>{

    @Autowired
    private ProductRepository productRepository;

    @Override
    protected JpaRepository<Product, Long> getRepository(){

        return productRepository;
    }
}

