package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.Sale;
import br.com.sigrest.api.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;

public class SaleServiceImpl extends GenericServiceImpl<Sale, Long>{

    @Autowired
    private SaleRepository saleRepository;

    @Override
    protected JpaRepository<Sale, Long> getRepository(){
        return saleRepository;
    }
}

