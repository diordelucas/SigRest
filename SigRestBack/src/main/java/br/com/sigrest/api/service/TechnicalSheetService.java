package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.TechnicalSheetItemRequestDTO;
import br.com.sigrest.api.dto.TechnicalSheetRequestDTO;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.TechnicalSheet;
import br.com.sigrest.api.entity.TechnicalSheetItem;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.TechnicalSheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TechnicalSheetService {

    @Autowired
    private TechnicalSheetRepository repository;

    @Autowired
    private ProductRepository productRepository;

    public List<TechnicalSheet> findAll() {
        return repository.findAll();
    }

    public TechnicalSheet findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Ficha técnica não encontrada"));
    }

    @Transactional
    public TechnicalSheet save(TechnicalSheetRequestDTO dto) {
        TechnicalSheet sheet = new TechnicalSheet();
        if (dto.id() != null) {
            sheet = findById(dto.id());
        }

        sheet.setName(dto.name());
        
        Product finalProduct = productRepository.findById(dto.finalProductId())
            .orElseThrow(() -> new RuntimeException("Produto final não encontrado"));
        sheet.setFinalProduct(finalProduct);

        if (sheet.getItems() == null) {
            sheet.setItems(new ArrayList<>());
        } else {
            sheet.getItems().clear();
        }

        if (dto.items() != null) {
            for (TechnicalSheetItemRequestDTO itemDto : dto.items()) {
                TechnicalSheetItem item = new TechnicalSheetItem();
                item.setTechnicalSheet(sheet);
                item.setRawMaterial(productRepository.findById(itemDto.rawMaterialId())
                    .orElseThrow(() -> new RuntimeException("Insumo não encontrado: " + itemDto.rawMaterialId())));
                item.setQuantity(itemDto.quantity());
                sheet.getItems().add(item);
            }
        }

        return repository.save(sheet);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}

