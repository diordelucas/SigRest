package br.com.sigrest.api.service.report;

import br.com.sigrest.api.entity.ProductType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Formatação pt-BR usada nos templates Thymeleaf dos relatórios em PDF (disponível como
 * {@code ${fmt}}). Centraliza moeda, datas e os rótulos dos enums para que todos os relatórios
 * mostrem os mesmos textos que as telas do sistema. Valores nulos viram "—".
 */
public class ReportFormatter {

    static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private static final String VAZIO = "—";
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final String[] MESES = {
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    };

    public String moeda(BigDecimal valor) {
        BigDecimal v = valor != null ? valor : BigDecimal.ZERO;
        String numero = decimal(v.abs(), 2);
        return v.signum() < 0 ? "-R$ " + numero : "R$ " + numero;
    }

    public String decimal(BigDecimal valor, int casas) {
        if (valor == null) {
            return VAZIO;
        }
        String padrao = casas > 0 ? "#,##0." + "0".repeat(casas) : "#,##0";
        return new DecimalFormat(padrao, DecimalFormatSymbols.getInstance(PT_BR))
                .format(valor.setScale(casas, RoundingMode.HALF_UP));
    }

    /** Quantidade sem zeros à direita (ex.: 1.500 g, 2,5 un). */
    public String quantidade(BigDecimal valor) {
        if (valor == null) {
            return VAZIO;
        }
        return new DecimalFormat("#,##0.###", DecimalFormatSymbols.getInstance(PT_BR)).format(valor);
    }

    public String percentual(BigDecimal valor) {
        return valor != null ? decimal(valor, 2) + "%" : VAZIO;
    }

    /** Quanto {@code valor} representa de {@code total}, ex.: "37,5%". */
    public String participacao(BigDecimal valor, BigDecimal total) {
        if (valor == null || total == null || total.signum() == 0) {
            return VAZIO;
        }
        return decimal(valor.multiply(new BigDecimal("100")).divide(total, 4, RoundingMode.HALF_UP), 1) + "%";
    }

    public String data(LocalDate data) {
        return data != null ? data.format(DATA) : VAZIO;
    }

    public String dataHora(LocalDateTime dataHora) {
        return dataHora != null ? dataHora.format(DATA_HORA) : VAZIO;
    }

    public String mes(YearMonth mes) {
        return mes != null ? MESES[mes.getMonthValue() - 1] + "/" + mes.getYear() : VAZIO;
    }

    /** Mês no formato ISO "2026-10" (como vem no fluxo financeiro) → "Out/2026". */
    public String mesIso(String mesIso) {
        if (mesIso == null || mesIso.isBlank()) {
            return VAZIO;
        }
        return mes(YearMonth.parse(mesIso));
    }

    /**
     * Largura (em %) da barra de um gráfico horizontal feito em CSS, proporcional ao maior valor
     * do relatório. Sai com ponto decimal porque vai direto para o atributo style.
     */
    public String largura(BigDecimal valor, BigDecimal maximo) {
        if (valor == null || maximo == null || maximo.signum() <= 0 || valor.signum() <= 0) {
            return "0";
        }
        BigDecimal pct = valor.multiply(new BigDecimal("100")).divide(maximo, 1, RoundingMode.HALF_UP);
        return pct.max(new BigDecimal("0.5")).min(new BigDecimal("100")).toPlainString();
    }

    /** Variantes para contagens inteiras (nome próprio para o SpEL não ter overload ambíguo com null). */
    public String inteiro(Long valor) {
        return valor != null ? quantidade(BigDecimal.valueOf(valor)) : VAZIO;
    }

    public String larguraInteira(Long valor, Long maximo) {
        return largura(valor != null ? BigDecimal.valueOf(valor) : null, maximo != null ? BigDecimal.valueOf(maximo) : null);
    }

    public String texto(String valor) {
        return valor != null && !valor.isBlank() ? valor : VAZIO;
    }

    // ============================ Rótulos dos enums ============================

    public String tipoProduto(ProductType tipo) {
        if (tipo == null) {
            return VAZIO;
        }
        return switch (tipo) {
            case INSUMO -> "Insumo";
            case PRODUTO_FINAL -> "Produto final";
            case PRODUTO_INTERMEDIARIO -> "Produto intermediário";
        };
    }

    public String tipoMovimento(Object tipo) {
        if (tipo == null) {
            return VAZIO;
        }
        return switch (tipo.toString()) {
            case "ENTRY" -> "Entrada";
            case "EXIT" -> "Saída";
            case "LOSS" -> "Perda";
            default -> tipo.toString();
        };
    }

    public String motivoPerda(String motivo) {
        if (motivo == null) {
            return VAZIO;
        }
        return switch (motivo) {
            case "VENCIMENTO" -> "Vencimento";
            case "ERRO_PREPARO" -> "Erro de preparo";
            case "DESCARTE_QUALIDADE" -> "Descarte de qualidade";
            case "OUTRO" -> "Outro";
            default -> motivo;
        };
    }

    public String origemPerda(String origem) {
        if (origem == null) {
            return VAZIO;
        }
        return switch (origem) {
            case "PRODUCAO" -> "Produção";
            case "ESTOQUE" -> "Estoque";
            default -> origem;
        };
    }

    public String statusConta(String status) {
        if (status == null) {
            return VAZIO;
        }
        return switch (status) {
            case "PENDING" -> "A vencer";
            case "PAID" -> "Paga";
            case "RECEIVED" -> "Recebida";
            case "OVERDUE" -> "Vencida";
            default -> status;
        };
    }

    public String formaPagamento(String forma) {
        if (forma == null || forma.isBlank()) {
            return "Não informada";
        }
        return switch (forma) {
            case "DINHEIRO" -> "Dinheiro";
            case "CARTAO_DEBITO" -> "Cartão de débito";
            case "CARTAO_CREDITO" -> "Cartão de crédito";
            case "PIX" -> "PIX";
            case "BOLETO" -> "Boleto";
            default -> forma;
        };
    }

    /** Ação de auditoria ("PAGAR_CONTA") em texto legível ("Pagar conta"). */
    public String acao(String acao) {
        if (acao == null || acao.isBlank()) {
            return VAZIO;
        }
        String texto = acao.replace('_', ' ').toLowerCase(PT_BR);
        return Character.toUpperCase(texto.charAt(0)) + texto.substring(1);
    }
}
