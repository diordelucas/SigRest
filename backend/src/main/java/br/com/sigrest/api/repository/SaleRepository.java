package br.com.sigrest.api.repository;

import br.com.sigrest.api.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Optional;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByIdempotencyKey(String idempotencyKey);

    /** Soma do faturamento no intervalo informado, descontados os estornos. Agregação feita no banco. */
    @Query("SELECT COALESCE(SUM(s.total - s.reversedAmount), 0) FROM sale s WHERE s.status <> br.com.sigrest.api.entity.SaleStatus.REVERSED AND s.date BETWEEN :start AND :end")
    BigDecimal sumTotalBetween(@Param("start") Date start, @Param("end") Date end);

    /** Quantidade de vendas no intervalo informado. */
    @Query("SELECT COUNT(s) FROM sale s WHERE s.status <> br.com.sigrest.api.entity.SaleStatus.REVERSED AND s.date BETWEEN :start AND :end")
    long countSalesBetween(@Param("start") Date start, @Param("end") Date end);

    /** Vendas do intervalo, exceto a situação informada, em ordem cronológica (relatório de vendas em PDF). */
    List<Sale> findByDateBetweenAndStatusNotOrderByDateAsc(Date start, Date end, br.com.sigrest.api.entity.SaleStatus status);

    /**
     * Vendas em dinheiro de um caixa. Inclui os valores estornados de propósito: o estorno lança uma
     * saída no caixa, então a venda continua contando como a entrada que de fato aconteceu.
     */
    @Query("SELECT COALESCE(SUM(s.total), 0) FROM sale s WHERE s.cashRegister.id = :cashRegisterId AND s.paymentMethod = 'DINHEIRO'")
    BigDecimal sumCashSalesByCashRegister(@Param("cashRegisterId") Long cashRegisterId);

    /** Vendas em PIX e cartão de um caixa, sem os estornos: informativo, esse dinheiro não entra na gaveta. */
    @Query("SELECT COALESCE(SUM(s.total - s.reversedAmount), 0) FROM sale s WHERE s.cashRegister.id = :cashRegisterId AND s.paymentMethod <> 'DINHEIRO' AND s.status <> br.com.sigrest.api.entity.SaleStatus.REVERSED")
    BigDecimal sumOtherPaymentsByCashRegister(@Param("cashRegisterId") Long cashRegisterId);
}
