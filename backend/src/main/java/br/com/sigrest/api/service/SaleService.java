package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.SaleRequestDTO;
import br.com.sigrest.api.dto.SaleResponseDTO;
import br.com.sigrest.api.entity.CashMovement;
import br.com.sigrest.api.entity.CashRegister;
import br.com.sigrest.api.entity.Person;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductType;
import br.com.sigrest.api.entity.Sale;
import br.com.sigrest.api.entity.SaleStatus;
import br.com.sigrest.api.entity.SellItem;
import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.exception.BusinessException;
import br.com.sigrest.api.exception.ErrorCode;
import br.com.sigrest.api.repository.CashMovementRepository;
import br.com.sigrest.api.repository.CashRegisterRepository;
import br.com.sigrest.api.repository.PersonRepository;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.SaleRepository;
import br.com.sigrest.api.service.audit.LogAtividadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMovementService stockMovementService;

    @Autowired
    private CashRegisterRepository cashRegisterRepository;

    @Autowired
    private CashMovementRepository cashMovementRepository;

    @Autowired
    private LogAtividadeService logAtividadeService;

    @Transactional
    public SaleResponseDTO createSale(SaleRequestDTO saleRequestDTO) {
        if (saleRequestDTO.idempotencyKey() != null && !saleRequestDTO.idempotencyKey().isBlank()) {
            var existing = saleRepository.findByIdempotencyKey(saleRequestDTO.idempotencyKey());
            if (existing.isPresent()) {
                return convertToResponseDTO(existing.get());
            }
        }

        CashRegister cashRegister = cashRegisterRepository.findByIsOpenTrue()
                .orElseThrow(() -> new BusinessException(ErrorCode.CASH_NAO_ABERTO,
                        "Não há caixa aberto. Abra o caixa antes de registrar a venda."));

        BigDecimal discount = saleRequestDTO.discount() != null ? saleRequestDTO.discount() : BigDecimal.ZERO;
        BigDecimal subtotal = saleRequestDTO.items().stream()
                .map(item -> item.unitPrice().multiply(item.quantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (discount.compareTo(subtotal) > 0) {
            throw new BusinessException(ErrorCode.SALE_DESCONTO_INVALIDO);
        }

        Sale sale = new Sale();
        sale.setDate(new Date()); // Set current date for the sale
        sale.setDiscount(discount);
        sale.setCashRegister(cashRegister);
        sale.setPaymentMethod(saleRequestDTO.paymentMethod());
        sale.setIdempotencyKey(saleRequestDTO.idempotencyKey());

        if (saleRequestDTO.personId() != null) {
            Person person = personRepository.findById(saleRequestDTO.personId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PERSON_NAO_ENCONTRADA));
            sale.setPerson(person);
        }

        // Salva o cabeçalho primeiro para ter o id real disponível na descrição das
        // movimentações de estoque abaixo (senão "Venda #" + sale.getId() sai como "Venda #null").
        sale = saleRepository.save(sale);

        for (var itemDTO : saleRequestDTO.items()) {
            Product product = productRepository.findById(itemDTO.productId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PROD_NAO_ENCONTRADO, "Produto não encontrado: " + itemDTO.productId()));

            if (!product.isActive() || product.getTipo() == ProductType.INSUMO
                    || product.getTipo() == ProductType.PRODUTO_INTERMEDIARIO) {
                throw new BusinessException(ErrorCode.SALE_PRODUTO_NAO_VENDAVEL,
                        "Só produtos finais podem ser vendidos: " + product.getName());
            }

            BigDecimal currentStock = product.getStorage() != null ? product.getStorage() : java.math.BigDecimal.ZERO;
            if (currentStock.compareTo(itemDTO.quantity()) < 0) {
                throw new BusinessException(ErrorCode.STOCK_INSUFICIENTE, "Estoque insuficiente para o produto: " + product.getName());
            }

            SellItem sellItem = new SellItem();
            sellItem.setProduct(product);
            sellItem.setQuantity(itemDTO.quantity());
            sellItem.setUnitPrice(itemDTO.unitPrice());
            sellItem.setSale(sale);
            sale.getItems().add(sellItem);

            // Deduct stock (vendas de PRODUTO_FINAL são descontadas em UN)
            stockMovementService.createStockExit(product, itemDTO.quantity(), "Venda #" + sale.getId());
        }
        sale.setTotal(subtotal.subtract(discount));

        Sale savedSale = saleRepository.save(sale);
        logAtividadeService.registrar("CRIAR_VENDA", "Sale", savedSale.getId(),
                "Total: " + savedSale.getTotal(), logAtividadeService.usuarioAtual());
        return convertToResponseDTO(savedSale);
    }

    /**
     * Estorna a venda inteira: devolve os itens ao estoque e, se foi em dinheiro, lança a saída no
     * caixa aberto. A venda continua no histórico marcada como estornada, fora do faturamento.
     */
    @Transactional
    public SaleResponseDTO reverseSale(Long id, String reason, User currentUser) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SALE_NAO_ENCONTRADA));
        if (sale.getStatus() == SaleStatus.REVERSED) {
            throw new BusinessException(ErrorCode.SALE_JA_ESTORNADA);
        }

        BigDecimal total = sale.getTotal() != null ? sale.getTotal() : BigDecimal.ZERO;
        if ("DINHEIRO".equals(sale.getPaymentMethod()) && total.signum() > 0) {
            CashRegister cashRegister = cashRegisterRepository.findByIsOpenTrue()
                    .orElseThrow(() -> new BusinessException(ErrorCode.CASH_NAO_ABERTO,
                            "Abra o caixa antes de estornar uma venda em dinheiro: o valor precisa sair do caixa."));
            CashMovement movement = new CashMovement();
            movement.setCashRegister(cashRegister);
            movement.setDate(LocalDateTime.now());
            movement.setType(CashMovement.MovementType.EXPENSE);
            movement.setAmount(total);
            movement.setDescription("Estorno da Venda #" + sale.getId());
            movement.setUser(currentUser);
            cashMovementRepository.save(movement);
        }

        for (SellItem item : sale.getItems()) {
            stockMovementService.createStockEntry(item.getProduct(), item.getQuantity(), "Estorno da Venda #" + sale.getId());
        }

        sale.setStatus(SaleStatus.REVERSED);
        sale.setReversalDate(new Date());
        sale.setReversalReason(reason);
        sale.setReversedBy(currentUser);
        Sale saved = saleRepository.save(sale);

        logAtividadeService.registrar("ESTORNAR_VENDA", "Sale", saved.getId(),
                "Total: " + saved.getTotal() + " - Motivo: " + reason, currentUser);
        return convertToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SaleResponseDTO> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleResponseDTO getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SALE_NAO_ENCONTRADA));
        return convertToResponseDTO(sale);
    }

    private SaleResponseDTO convertToResponseDTO(Sale sale) {
        return new SaleResponseDTO(sale);
    }
}

