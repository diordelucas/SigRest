package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.PersonRequestDTO;
import br.com.sigrest.api.dto.PersonResponseDTO;
import br.com.sigrest.api.entity.Address;
import br.com.sigrest.api.entity.City;
import br.com.sigrest.api.entity.Person;
import br.com.sigrest.api.entity.State;
import br.com.sigrest.api.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("person")
public class PersonController {

    @Autowired
    private PersonRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void savePerson(@RequestBody PersonRequestDTO data){
        Person personData = new Person(data);

        // Criar e associar o endereÃ§o se os dados estiverem presentes
        if (data.street() != null || data.number() != null || data.nbhd() != null ||
                data.city() != null || data.uf() != null) {

            // Criar State
            State state = new State();
            state.setUf(data.uf());

            // Criar City
            City city = new City();
            city.setName(data.city());
            city.setState(state);

            // Criar Address
            Address address = new Address();
            address.setStreet(data.street());
            address.setNumber(data.number());
            address.setNbhd(data.nbhd());
            address.setCity(city);

            // Associar endereÃ§o Ã  pessoa
            personData.setAddress(address);
        }

        repository.save(personData);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/{id}")
    public PersonResponseDTO getPersonById(@PathVariable Long id){
        Person person = repository.findById(id).orElseThrow(() -> new RuntimeException("Pessoa nÃ£o encontrada"));
        return new PersonResponseDTO(person);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<PersonResponseDTO> getAll(){

        List<PersonResponseDTO> personList = repository.findAll().stream().map(PersonResponseDTO::new).toList();
            return personList;
        }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PutMapping("/{id}")
    public PersonResponseDTO updatePerson(@PathVariable Long id, @RequestBody PersonRequestDTO data) {
        Person person = repository.findById(id).orElseThrow(() -> new RuntimeException("Pessoa nÃ£o encontrada"));
        person.setName(data.name());
        person.setCpf(data.cpf());
        person.setEmail(data.email());
        person.setPhone(data.phone());

        Address address = person.getAddress();
        if (address == null) {
            address = new Address();
        }
        address.setStreet(data.street());
        address.setNumber(data.number());
        address.setNbhd(data.nbhd());

        City city = address.getCity();
        if (city == null) {
            city = new City();
        }
        city.setName(data.city());

        State state = city.getState();
        if (state == null) {
            state = new State();
        }
        state.setUf(data.uf());

        city.setState(state);
        address.setCity(city);
        person.setAddress(address);

        person = repository.save(person);

        return new PersonResponseDTO(person);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @DeleteMapping("/{id}")
    public void deletePerson(@PathVariable Long id) {
        repository.deleteById(id);
    }

    }

