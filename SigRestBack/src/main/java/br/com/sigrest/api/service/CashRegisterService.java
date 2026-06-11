package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.CashRegisterRequestDTO;
import br.com.sigrest.api.dto.CashRegisterResponseDTO;
import br.com.sigrest.api.dto.UserResponseDTO;
import br.com.sigrest.api.entity.CashRegister;
import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.repository.CashRegisterRepository;
import br.com.sigrest.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CashRegisterService {

    @Autowired
    private CashRegisterRepository cashRegisterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CashMovementService cashMovementService; // To be created

    @Transactional
    public CashRegisterResponseDTO openCashRegister(CashRegisterRequestDTO requestDTO) {
        if (cashRegisterRepository.findByIsOpenTrue().isPresent()) {
            throw new RuntimeException("JÃ¡ existe um caixa aberto.");
        }

        User openedBy = userRepository.findById(requestDTO.getOpenedByUserId())
                .orElseThrow(() -> new RuntimeException("UsuÃ¡rio nÃ£o encontrado."));

        CashRegister cashRegister = new CashRegister();
        cashRegister.setOpeningTime(LocalDateTime.now());
        cashRegister.setOpeningBalance(requestDTO.getOpeningBalance());
        cashRegister.setOpenedBy(openedBy);
        cashRegister.setOpen(true);

        CashRegister savedCashRegister = cashRegisterRepository.save(cashRegister);
        return convertToResponseDTO(savedCashRegister);
    }

    @Transactional
    public CashRegisterResponseDTO closeCashRegister(Long cashRegisterId, Long closedByUserId) {
        CashRegister cashRegister = cashRegisterRepository.findById(cashRegisterId)
                .orElseThrow(() -> new RuntimeException("Caixa nÃ£o encontrado."));

        if (!cashRegister.isOpen()) {
            throw new RuntimeException("O caixa jÃ¡ estÃ¡ fechado.");
        }

        User closedBy = userRepository.findById(closedByUserId)
                .orElseThrow(() -> new RuntimeException("UsuÃ¡rio nÃ£o encontrado."));

        cashRegister.setClosingTime(LocalDateTime.now());
        // Calculate closing balance based on opening balance and all movements
        BigDecimal totalMovements = cashMovementService.getTotalMovementsForCashRegister(cashRegisterId);
        cashRegister.setClosingBalance(cashRegister.getOpeningBalance().add(totalMovements));
        cashRegister.setClosedBy(closedBy);
        cashRegister.setOpen(false);

        CashRegister updatedCashRegister = cashRegisterRepository.save(cashRegister);
        return convertToResponseDTO(updatedCashRegister);
    }

    public CashRegisterResponseDTO getCurrentOpenCashRegister() {
        return cashRegisterRepository.findByIsOpenTrue()
                .map(this::convertToResponseDTO)
                .orElse(null);
    }

    public List<CashRegisterResponseDTO> getAllCashRegisters() {
        return cashRegisterRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public CashRegisterResponseDTO getCashRegisterById(Long id) {
        CashRegister cashRegister = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caixa nÃ£o encontrado."));
        return convertToResponseDTO(cashRegister);
    }

    private CashRegisterResponseDTO convertToResponseDTO(CashRegister cashRegister) {
        CashRegisterResponseDTO dto = new CashRegisterResponseDTO();
        dto.setId(cashRegister.getId());
        dto.setOpeningTime(cashRegister.getOpeningTime());
        dto.setClosingTime(cashRegister.getClosingTime());
        dto.setOpeningBalance(cashRegister.getOpeningBalance());
        dto.setClosingBalance(cashRegister.getClosingBalance());
        dto.setOpen(cashRegister.isOpen());
        if (cashRegister.getOpenedBy() != null) {
            dto.setOpenedBy(new UserResponseDTO(cashRegister.getOpenedBy().getId(), cashRegister.getOpenedBy().getName(), cashRegister.getOpenedBy().getEmail(), cashRegister.getOpenedBy().getRole()));
        }
        if (cashRegister.getClosedBy() != null) {
            dto.setClosedBy(new UserResponseDTO(cashRegister.getClosedBy().getId(), cashRegister.getClosedBy().getName(), cashRegister.getClosedBy().getEmail(), cashRegister.getClosedBy().getRole()));
        }
        return dto;
    }
}

