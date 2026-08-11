package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.AccountReceivableRequestDTO;
import br.com.sigrest.api.dto.AccountReceivableResponseDTO;
import br.com.sigrest.api.service.AccountReceivableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts-receivable")
public class AccountReceivableController {

    @Autowired
    private AccountReceivableService accountReceivableService;

    @PostMapping
    public ResponseEntity<AccountReceivableResponseDTO> createAccountReceivable(@RequestBody AccountReceivableRequestDTO requestDTO) {
        AccountReceivableResponseDTO createdAccount = accountReceivableService.createAccountReceivable(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAccount);
    }

    @PutMapping("/receive/{id}")
    public ResponseEntity<AccountReceivableResponseDTO> receiveAccountReceivable(@PathVariable Long id) {
        AccountReceivableResponseDTO receivedAccount = accountReceivableService.receiveAccountReceivable(id);
        return ResponseEntity.ok(receivedAccount);
    }

    @GetMapping
    public ResponseEntity<List<AccountReceivableResponseDTO>> getAllAccountReceivables() {
        List<AccountReceivableResponseDTO> accounts = accountReceivableService.getAllAccountReceivables();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountReceivableResponseDTO> getAccountReceivableById(@PathVariable Long id) {
        AccountReceivableResponseDTO account = accountReceivableService.getAccountReceivableById(id);
        return ResponseEntity.ok(account);
    }
}
