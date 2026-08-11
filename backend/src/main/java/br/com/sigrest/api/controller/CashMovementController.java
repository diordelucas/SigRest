package br.com.sigrest.api.controller;

import br.com.sigrest.api.dto.CashMovementRequestDTO;
import br.com.sigrest.api.dto.CashMovementResponseDTO;
import br.com.sigrest.api.service.CashMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Modulo financeiro: acesso restrito a ADMIN (TCC, secao 5.1). */
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/cash-movements")
public class CashMovementController {

    @Autowired
    private CashMovementService cashMovementService;

    @PostMapping
    public ResponseEntity<CashMovementResponseDTO> createCashMovement(@RequestBody CashMovementRequestDTO requestDTO) {
        CashMovementResponseDTO createdMovement = cashMovementService.createCashMovement(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMovement);
    }

    @GetMapping("/cash-register/{cashRegisterId}")
    public ResponseEntity<List<CashMovementResponseDTO>> getMovementsByCashRegister(@PathVariable Long cashRegisterId) {
        List<CashMovementResponseDTO> movements = cashMovementService.getMovementsByCashRegister(cashRegisterId);
        return ResponseEntity.ok(movements);
    }
}
