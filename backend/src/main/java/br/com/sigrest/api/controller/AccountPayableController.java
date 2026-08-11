package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.AccountPayableRequestDTO;
import br.com.sigrest.api.dto.AccountPayableResponseDTO;
import br.com.sigrest.api.service.AccountPayableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts-payable")
public class AccountPayableController {

    @Autowired
    private AccountPayableService accountPayableService;

    @PostMapping
    public ResponseEntity<AccountPayableResponseDTO> createAccountPayable(@RequestBody AccountPayableRequestDTO requestDTO) {
        AccountPayableResponseDTO createdAccount = accountPayableService.createAccountPayable(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAccount);
    }

    @PutMapping("/pay/{id}")
    public ResponseEntity<AccountPayableResponseDTO> payAccountPayable(@PathVariable Long id) {
        AccountPayableResponseDTO paidAccount = accountPayableService.payAccountPayable(id);
        return ResponseEntity.ok(paidAccount);
    }

    @GetMapping
    public ResponseEntity<List<AccountPayableResponseDTO>> getAllAccountPayables() {
        List<AccountPayableResponseDTO> accounts = accountPayableService.getAllAccountPayables();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountPayableResponseDTO> getAccountPayableById(@PathVariable Long id) {
        AccountPayableResponseDTO account = accountPayableService.getAccountPayableById(id);
        return ResponseEntity.ok(account);
    }
}
