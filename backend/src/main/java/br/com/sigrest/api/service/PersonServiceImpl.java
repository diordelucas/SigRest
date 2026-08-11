package br.com.sigrest.api.service;

import br.com.sigrest.api.entity.Person;
import br.com.sigrest.api.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;

public class PersonServiceImpl extends GenericServiceImpl<Person, Long>{

    @Autowired
    private PersonRepository personRepository;

    @Override
    protected JpaRepository<Person, Long> getRepository(){
        return personRepository;
    }
}

