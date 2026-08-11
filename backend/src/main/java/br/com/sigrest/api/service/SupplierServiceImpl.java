package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.Supplier;
import br.com.sigrest.api.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;

public class SupplierServiceImpl extends GenericServiceImpl<Supplier, Long>{

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    protected JpaRepository<Supplier, Long> getRepository(){
        return supplierRepository;
    }
}

