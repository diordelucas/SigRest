package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.SupplierRequestDTO;
import br.com.sigrest.api.dto.SupplierResponseDTO;
import br.com.sigrest.api.entity.Address;
import br.com.sigrest.api.entity.City;
import br.com.sigrest.api.entity.State;
import br.com.sigrest.api.entity.Supplier;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.repository.SupplierRepository;
import br.com.sigrest.api.util.Documentos;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("supplier")
public class SupplierController {

    @Autowired
    private SupplierRepository repository;

    /** CNPJ e opcional; quando informado, o digito verificador precisa ser valido. */
    private void validateCnpj(String cnpj) {
        if (cnpj != null && !cnpj.isBlank() && !Documentos.isValidCNPJ(cnpj)) {
            throw new BusinessException(ErrorCode.SUPP_CNPJ_INVALIDO);
        }
    }

    /** CEP e opcional; quando informado, precisa ter os 8 digitos. */
    private void validateCep(String cep) {
        if (cep != null && !cep.isBlank() && !Documentos.isValidCep(cep)) {
            throw new BusinessException(ErrorCode.GEO_CEP_INVALIDO);
        }
    }

    private void validateContact(String phone, String uf) {
        if (phone != null && !phone.isBlank() && !Documentos.isValidTelefone(phone)) {
            throw new BusinessException(ErrorCode.GEN_TELEFONE_INVALIDO);
        }
        if (uf != null && !uf.isBlank() && !Documentos.isValidUF(uf)) {
            throw new BusinessException(ErrorCode.GEO_UF_INVALIDA);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public void saveSupplier(@Valid @RequestBody SupplierRequestDTO data) {
        validateCnpj(data.cnpj());
        validateContact(data.phone(), data.uf());
        validateCep(data.cep());
        Supplier supplier = new Supplier(data);

        if (data.street() != null || data.city() != null || data.uf() != null) {
            State state = new State();
            state.setUf(data.uf());

            City city = new City();
            city.setName(data.city());
            city.setState(state);

            Address address = new Address();
            address.setStreet(data.street());
            address.setNumber(data.number());
            address.setNbhd(data.nbhd());
            address.setCep(Documentos.normalizarCep(data.cep()));
            address.setCity(city);

            supplier.setAddress(address);
        }

        repository.save(supplier);
    }

    @GetMapping
    public List<SupplierResponseDTO> getAll() {
        return repository.findAll().stream().filter(Supplier::isActive).map(SupplierResponseDTO::new).toList();
    }

    @GetMapping("/{id}")
    public SupplierResponseDTO getSupplierById(@PathVariable Long id) {
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUPP_NAO_ENCONTRADO));
        return new SupplierResponseDTO(supplier);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public SupplierResponseDTO updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierRequestDTO data) {
        validateCnpj(data.cnpj());
        validateContact(data.phone(), data.uf());
        validateCep(data.cep());
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUPP_NAO_ENCONTRADO));

        supplier.setName(data.name());
        supplier.setCnpj(data.cnpj());
        supplier.setRegistration(data.registration());
        supplier.setPhone(data.phone());
        supplier.setEmail(data.email());

        Address address = supplier.getAddress();
        if (address == null) address = new Address();
        address.setStreet(data.street());
        address.setNumber(data.number());
        address.setNbhd(data.nbhd());
        address.setCep(Documentos.normalizarCep(data.cep()));

        City city = address.getCity();
        if (city == null) city = new City();
        city.setName(data.city());

        State state = city.getState();
        if (state == null) state = new State();
        state.setUf(data.uf());

        city.setState(state);
        address.setCity(city);
        supplier.setAddress(address);

        return new SupplierResponseDTO(repository.save(supplier));
    }

    /** Nunca remove fisicamente: so desativa, preservando o historico de compras deste fornecedor. */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteSupplier(@PathVariable Long id) {
        Supplier supplier = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUPP_NAO_ENCONTRADO));
        supplier.setActive(false);
        repository.save(supplier);
    }
}