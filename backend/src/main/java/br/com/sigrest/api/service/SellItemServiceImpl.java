package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.SellItem;
import br.com.sigrest.api.repository.SellItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;

public class SellItemServiceImpl extends GenericServiceImpl<SellItem, Long>{

    @Autowired
    private SellItemRepository sellItemRepository;

    @Override
    protected JpaRepository<SellItem, Long> getRepository(){
        return sellItemRepository;
    }
}

