package br.com.sigrest.api.service;

import br.com.sigrest.api.dto.SaleRequestDTO;
import br.com.sigrest.api.dto.SaleReversalItemRequestDTO;
import br.com.sigrest.api.dto.SaleReversalRequestDTO;
import br.com.sigrest.api.dto.SaleResponseDTO;
import br.com.sigrest.api.entity.CashMovement;
import br.com.sigrest.api.entity.CashRegister;
import br.com.sigrest.api.entity.Person;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductType;
import br.com.sigrest.api.entity.Sale;
import br.com.sigrest.api.entity.SaleReversal;
import br.com.sigrest.api.entity.SaleReversalItem;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
                .map(item -> item.unitPrice().multiply(item.quantity()).setScale(2, RoundingMode.HALF_UP))
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
            stockMovementService.validateQuantity(product, itemDTO.quantity());

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

            // Deduct stock (vendas de PRODUTO_FINAL são descontadas na unidade de venda)
            stockMovementService.createStockExit(product, itemDTO.quantity(), "Venda #" + sale.getId());
        }
        sale.setTotal(subtotal.subtract(discount));

        Sale savedSale = saleRepository.save(sale);
        logAtividadeService.registrar("CRIAR_VENDA", "Sale", savedSale.getId(),
                "Total: " + savedSale.getTotal(), logAtividadeService.usuarioAtual());
        return convertToResponseDTO(savedSale);
    }

    /**
     * Estorna a venda inteira ou parte dos itens: devolve as quantidades ao estoque e, se foi em dinheiro,
     * lança a saída no caixa aberto. A venda continua no histórico, e só o que sobrou conta no faturamento.
     */
    @Transactional
    public SaleResponseDTO reverseSale(Long id, SaleReversalRequestDTO data, User currentUser) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SALE_NAO_ENCONTRADA));
        if (sale.getStatus() == SaleStatus.REVERSED) {
            throw new BusinessException(ErrorCode.SALE_JA_ESTORNADA);
        }

        Map<SellItem, BigDecimal> quantidades = quantidadesAEstornar(sale, data.items());
        boolean encerraVenda = sale.getItems().stream().allMatch(item ->
                item.getNetQuantity().compareTo(quantidades.getOrDefault(item, BigDecimal.ZERO)) == 0);
        boolean vendaInteira = encerraVenda && sale.getReversals().isEmpty();
        BigDecimal valor = valorDoEstorno(sale, quantidades, encerraVenda);
        String descricao = (vendaInteira ? "Estorno da Venda #" : "Estorno parcial da Venda #") + sale.getId();
        String motivo = data.reason().trim();

        if ("DINHEIRO".equals(sale.getPaymentMethod()) && valor.signum() > 0) {
            CashRegister cashRegister = cashRegisterRepository.findByIsOpenTrue()
                    .orElseThrow(() -> new BusinessException(ErrorCode.CASH_NAO_ABERTO,
                            "Abra o caixa antes de estornar uma venda em dinheiro: o valor precisa sair do caixa."));
            CashMovement movement = new CashMovement();
            movement.setCashRegister(cashRegister);
            movement.setDate(LocalDateTime.now());
            movement.setType(CashMovement.MovementType.EXPENSE);
            movement.setAmount(valor);
            movement.setDescription(descricao);
            movement.setUser(currentUser);
            cashMovementRepository.save(movement);
        }

        SaleReversal reversal = new SaleReversal();
        reversal.setSale(sale);
        reversal.setDate(LocalDateTime.now());
        reversal.setReason(motivo);
        reversal.setAmount(valor);
        reversal.setUser(currentUser);
        quantidades.forEach((item, quantidade) -> {
            stockMovementService.createStockEntry(item.getProduct(), quantidade, descricao);
            item.setReversedQuantity(item.getReversedQuantity().add(quantidade));
            SaleReversalItem reversalItem = new SaleReversalItem();
            reversalItem.setReversal(reversal);
            reversalItem.setSellItem(item);
            reversalItem.setQuantity(quantidade);
            reversal.getItems().add(reversalItem);
        });
        sale.getReversals().add(reversal);
        sale.setReversedAmount(sale.getReversedAmount().add(valor));
        sale.setStatus(encerraVenda ? SaleStatus.REVERSED : SaleStatus.PARTIALLY_REVERSED);
        Sale saved = saleRepository.save(sale);

        logAtividadeService.registrar(vendaInteira ? "ESTORNAR_VENDA" : "ESTORNAR_VENDA_PARCIAL", "Sale", saved.getId(),
                "Valor: " + valor + " - Motivo: " + motivo, currentUser);
        return convertToResponseDTO(saved);
    }

    /** Sem itens informados, devolve tudo o que ainda não foi estornado. */
    private Map<SellItem, BigDecimal> quantidadesAEstornar(Sale sale, List<SaleReversalItemRequestDTO> pedidos) {
        Map<SellItem, BigDecimal> quantidades = new LinkedHashMap<>();
        if (pedidos == null || pedidos.isEmpty()) {
            sale.getItems().stream()
                    .filter(item -> item.getNetQuantity().signum() > 0)
                    .forEach(item -> quantidades.put(item, item.getNetQuantity()));
            return quantidades;
        }
        for (SaleReversalItemRequestDTO pedido : pedidos) {
            SellItem item = sale.getItems().stream()
                    .filter(i -> i.getId().equals(pedido.sellItemId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.SALE_ESTORNO_INVALIDO,
                            "Este item não pertence à venda #" + sale.getId() + "."));
            stockMovementService.validateQuantity(item.getProduct(), pedido.quantity());
            BigDecimal total = quantidades.merge(item, pedido.quantity(), BigDecimal::add);
            if (total.compareTo(item.getNetQuantity()) > 0) {
                throw new BusinessException(ErrorCode.SALE_ESTORNO_INVALIDO,
                        "Só é possível estornar " + item.getNetQuantity().stripTrailingZeros().toPlainString()
                                + " de " + item.getProduct().getName() + ".");
            }
        }
        return quantidades;
    }

    /**
     * O desconto é rateado entre os itens: devolver 1 de 4 itens iguais devolve 1/4 do total pago. O último
     * estorno devolve exatamente o que sobrou, para os arredondamentos não deixarem centavos para trás.
     */
    private BigDecimal valorDoEstorno(Sale sale, Map<SellItem, BigDecimal> quantidades, boolean encerraVenda) {
        if (encerraVenda) {
            return sale.getNetTotal();
        }
        BigDecimal subtotal = sale.getItems().stream()
                .map(SellItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (subtotal.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal devolvido = quantidades.entrySet().stream()
                .map(entrada -> entrada.getKey().getUnitPrice().multiply(entrada.getValue()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = sale.getTotal() != null ? sale.getTotal() : BigDecimal.ZERO;
        return devolvido.multiply(total).divide(subtotal, 2, RoundingMode.HALF_UP).min(sale.getNetTotal());
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

