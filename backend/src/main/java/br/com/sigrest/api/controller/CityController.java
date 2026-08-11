package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.CityRequestDTO;
import br.com.sigrest.api.dto.CityResponseDTO;
import br.com.sigrest.api.entity.City;
import br.com.sigrest.api.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("city")
public class CityController {

    @Autowired
    private CityRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveCity(@RequestBody CityRequestDTO data){
        City cityData = new City();
        cityData.setName(data.name());
        cityData.setState(data.state());
        repository.save(cityData);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<CityResponseDTO> getAll(){
        List<CityResponseDTO> cityList = repository.findAll().stream().map(CityResponseDTO::new).toList();
        return cityList;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public CityResponseDTO getCityById(@PathVariable Long id){
        City city = repository.findById(id).orElseThrow(() -> new RuntimeException("Cidade nÃ£o encontrada"));
        return new CityResponseDTO(city);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public CityResponseDTO updateCity(@PathVariable Long id, @RequestBody CityRequestDTO data) {
        City city = repository.findById(id).orElseThrow(() -> new RuntimeException("Cidade nÃ£o encontrada"));
        city.setName(data.name());
        city.setState(data.state());
        
        repository.save(city);

        return new CityResponseDTO(city);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deleteCity(@PathVariable Long id) {
        repository.deleteById(id);
    }
}

