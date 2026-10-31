package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.CashRegisterRequestDTO;
import br.com.sigrest.api.dto.CashRegisterResponseDTO;
import br.com.sigrest.api.dto.UserResponseDTO;
import br.com.sigrest.api.entity.CashRegister;
import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.repository.CashRegisterRepository;
import br.com.sigrest.api.repository.PurchaseRepository;
import br.com.sigrest.api.repository.SaleRepository;
import br.com.sigrest.api.repository.UserRepository;
import br.com.sigrest.api.service.audit.LogAtividadeService;
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
    private CashMovementService cashMovementService;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private LogAtividadeService logAtividadeService;

    @Transactional
    public CashRegisterResponseDTO openCashRegister(CashRegisterRequestDTO requestDTO) {
        if (cashRegisterRepository.findByIsOpenTrue().isPresent()) {
            throw new BusinessException(ErrorCode.CASH_JA_ABERTO);
        }

        if (requestDTO.getOpenedByUserId() == null) {
            throw new BusinessException(ErrorCode.GEN_PARAMETRO_AUSENTE, "Usuário responsável pela abertura não informado.");
        }

        User openedBy = userRepository.findById(requestDTO.getOpenedByUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NAO_ENCONTRADO));

        CashRegister cashRegister = new CashRegister();
        cashRegister.setOpeningTime(LocalDateTime.now());
        cashRegister.setOpeningBalance(requestDTO.getOpeningBalance());
        cashRegister.setOpenedBy(openedBy);
        cashRegister.setOpen(true);

        CashRegister savedCashRegister = cashRegisterRepository.save(cashRegister);
        logAtividadeService.registrar("ABRIR_CAIXA", "CashRegister", savedCashRegister.getId(),
                "Caixa aberto com saldo inicial de " + savedCashRegister.getOpeningBalance(), openedBy);
        return convertToResponseDTO(savedCashRegister);
    }

    @Transactional
    public CashRegisterResponseDTO closeCashRegister(Long cashRegisterId, Long closedByUserId, BigDecimal countedBalance) {
        CashRegister cashRegister = cashRegisterRepository.findById(cashRegisterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CASH_NAO_ENCONTRADO));

        if (!cashRegister.isOpen()) {
            throw new BusinessException(ErrorCode.CASH_NAO_ABERTO);
        }

        User closedBy = userRepository.findById(closedByUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NAO_ENCONTRADO));

        cashRegister.setClosingTime(LocalDateTime.now());
        cashRegister.setCountedBalance(countedBalance);
        cashRegister.setClosedBy(closedBy);
        cashRegister.setOpen(false);

        // Saldo final = abertura + movimentações manuais + vendas em dinheiro - compras
        BigDecimal movements = cashMovementService.getTotalMovementsForCashRegister(cashRegisterId);
        BigDecimal sales = nullSafe(saleRepository.sumCashSalesByCashRegister(cashRegisterId));
        BigDecimal purchases = nullSafe(purchaseRepository.sumTotalByCashRegister(cashRegisterId));
        cashRegister.setClosingBalance(
                nullSafe(cashRegister.getOpeningBalance())
                        .add(movements)
                        .add(sales)
                        .subtract(purchases)
        );

        CashRegister updatedCashRegister = cashRegisterRepository.save(cashRegister);
        logAtividadeService.registrar("FECHAR_CAIXA", "CashRegister", updatedCashRegister.getId(),
                "Caixa fechado com saldo final de " + updatedCashRegister.getClosingBalance()
                        + (countedBalance != null ? " e valor contado de " + countedBalance : ""), closedBy);
        return convertToResponseDTO(updatedCashRegister);
    }

    @Transactional(readOnly = true)
    public CashRegisterResponseDTO getCurrentOpenCashRegister() {
        return cashRegisterRepository.findByIsOpenTrue()
                .map(this::convertToResponseDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<CashRegisterResponseDTO> getAllCashRegisters() {
        return cashRegisterRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CashRegisterResponseDTO getCashRegisterById(Long id) {
        CashRegister cashRegister = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CASH_NAO_ENCONTRADO));
        return convertToResponseDTO(cashRegister);
    }

    private CashRegisterResponseDTO convertToResponseDTO(CashRegister cashRegister) {

        BigDecimal opening = nullSafe(cashRegister.getOpeningBalance());
        BigDecimal movements = cashRegister.getId() != null
                ? cashMovementService.getTotalMovementsForCashRegister(cashRegister.getId())
                : BigDecimal.ZERO;
        BigDecimal sales = BigDecimal.ZERO;
        BigDecimal otherPayments = BigDecimal.ZERO;
        BigDecimal purchases = BigDecimal.ZERO;
        if (cashRegister.getId() != null) {
            sales = nullSafe(saleRepository.sumCashSalesByCashRegister(cashRegister.getId()));
            otherPayments = nullSafe(saleRepository.sumOtherPaymentsByCashRegister(cashRegister.getId()));
            purchases = nullSafe(purchaseRepository.sumTotalByCashRegister(cashRegister.getId()));
        }

        CashRegisterResponseDTO dto = new CashRegisterResponseDTO();
        dto.setId(cashRegister.getId());
        dto.setOpeningTime(cashRegister.getOpeningTime());
        dto.setClosingTime(cashRegister.getClosingTime());
        dto.setOpeningBalance(cashRegister.getOpeningBalance());
        dto.setClosingBalance(cashRegister.getClosingBalance());
        dto.setOpen(cashRegister.isOpen());
        dto.setCountedBalance(cashRegister.getCountedBalance());
        if (cashRegister.getCountedBalance() != null && cashRegister.getClosingBalance() != null) {
            dto.setDifference(cashRegister.getCountedBalance().subtract(cashRegister.getClosingBalance()));
        }
        dto.setSalesTotal(sales);
        dto.setOtherPaymentsTotal(otherPayments);
        dto.setPurchasesTotal(purchases);
        dto.setMovementsTotal(movements);
        dto.setCurrentBalance(opening.add(movements).add(sales).subtract(purchases));

        if (cashRegister.getOpenedBy() != null) {
            dto.setOpenedBy(new UserResponseDTO(
                    cashRegister.getOpenedBy().getId(),
                    cashRegister.getOpenedBy().getName(),
                    cashRegister.getOpenedBy().getEmail(),
                    cashRegister.getOpenedBy().getRole()));
        }
        if (cashRegister.getClosedBy() != null) {
            dto.setClosedBy(new UserResponseDTO(
                    cashRegister.getClosedBy().getId(),
                    cashRegister.getClosedBy().getName(),
                    cashRegister.getClosedBy().getEmail(),
                    cashRegister.getClosedBy().getRole()));
        }
        return dto;
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
