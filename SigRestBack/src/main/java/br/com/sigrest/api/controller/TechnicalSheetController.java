package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.TechnicalSheetRequestDTO;
import br.com.sigrest.api.dto.TechnicalSheetResponseDTO;
import br.com.sigrest.api.entity.TechnicalSheet;
import br.com.sigrest.api.service.TechnicalSheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/technical-sheet")
public class TechnicalSheetController {

    @Autowired
    private TechnicalSheetService service;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public TechnicalSheetResponseDTO save(@RequestBody TechnicalSheetRequestDTO data) {
        return new TechnicalSheetResponseDTO(service.save(data));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<TechnicalSheetResponseDTO> getAll() {
        return service.findAll().stream().map(TechnicalSheetResponseDTO::new).toList();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public TechnicalSheetResponseDTO getById(@PathVariable Long id) {
        return new TechnicalSheetResponseDTO(service.findById(id));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public TechnicalSheetResponseDTO update(@PathVariable Long id, @RequestBody TechnicalSheetRequestDTO data) {
        TechnicalSheetRequestDTO dto = new TechnicalSheetRequestDTO(id, data.name(), data.finalProductId(), data.items());
        return new TechnicalSheetResponseDTO(service.save(dto));
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
