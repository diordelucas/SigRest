package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.CashRegisterRequestDTO;
import br.com.sigrest.api.dto.CashRegisterResponseDTO;
import br.com.sigrest.api.service.CashRegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cash-registers")
public class CashRegisterController {

    @Autowired
    private CashRegisterService cashRegisterService;

    @PostMapping("/open")
    public ResponseEntity<CashRegisterResponseDTO> openCashRegister(@RequestBody CashRegisterRequestDTO requestDTO) {
        CashRegisterResponseDTO openedCashRegister = cashRegisterService.openCashRegister(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(openedCashRegister);
    }

    @PostMapping("/close/{id}")
    public ResponseEntity<CashRegisterResponseDTO> closeCashRegister(@PathVariable Long id, @RequestParam Long closedByUserId) {
        CashRegisterResponseDTO closedCashRegister = cashRegisterService.closeCashRegister(id, closedByUserId);
        return ResponseEntity.ok(closedCashRegister);
    }

    @GetMapping("/current-open")
    public ResponseEntity<CashRegisterResponseDTO> getCurrentOpenCashRegister() {
        CashRegisterResponseDTO currentOpen = cashRegisterService.getCurrentOpenCashRegister();
        return currentOpen != null ? ResponseEntity.ok(currentOpen) : ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CashRegisterResponseDTO>> getAllCashRegisters() {
        List<CashRegisterResponseDTO> cashRegisters = cashRegisterService.getAllCashRegisters();
        return ResponseEntity.ok(cashRegisters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashRegisterResponseDTO> getCashRegisterById(@PathVariable Long id) {
        CashRegisterResponseDTO cashRegister = cashRegisterService.getCashRegisterById(id);
        return ResponseEntity.ok(cashRegister);
    }
}
