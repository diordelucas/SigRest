package br.com.sigrest.api;

import br.com.sigrest.api.entity.AccountPayable;
import br.com.sigrest.api.entity.AccountReceivable;
import br.com.sigrest.api.entity.ActivityLog;
import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.entity.LossReason;
import br.com.sigrest.api.entity.Person;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductType;
import br.com.sigrest.api.entity.Purchase;
import br.com.sigrest.api.entity.PurchaseItem;
import br.com.sigrest.api.entity.Sale;
import br.com.sigrest.api.entity.SellItem;
import br.com.sigrest.api.entity.StockMovement;
import br.com.sigrest.api.entity.Supplier;
import br.com.sigrest.api.entity.TechnicalSheet;
import br.com.sigrest.api.entity.TechnicalSheetItem;
import br.com.sigrest.api.entity.UnitOfMeasure;
import br.com.sigrest.api.repository.AccountPayableRepository;
import br.com.sigrest.api.repository.AccountReceivableRepository;
import br.com.sigrest.api.repository.ActivityLogRepository;
import br.com.sigrest.api.repository.CategoryRepository;
import br.com.sigrest.api.repository.PersonRepository;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.PurchaseRepository;
import br.com.sigrest.api.repository.SaleRepository;
import br.com.sigrest.api.repository.StockMovementRepository;
import br.com.sigrest.api.repository.SupplierRepository;
import br.com.sigrest.api.repository.TechnicalSheetRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Gera cada relatório em PDF com dados reais no H2 e confere que sai um PDF válido com o conteúdo
 * esperado. Os arquivos ficam em {@code target/relatorios-pdf/} para conferência visual.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "test-admin@sigrest.local", roles = "ADMIN")
@DisplayName("Relatórios em PDF (Thymeleaf + OpenHTMLtoPDF)")
class ReportPdfIntegrationTest {

    private static final Path SAIDA = Path.of("target", "relatorios-pdf");
    private static boolean dadosCriados = false;

    private final LocalDate inicio = LocalDate.now().minusDays(30);
    private final LocalDate fim = LocalDate.now().plusDays(30);

    @Autowired private MockMvc mockMvc;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private TechnicalSheetRepository technicalSheetRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private PersonRepository personRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private SaleRepository saleRepository;
    @Autowired private StockMovementRepository stockMovementRepository;
    @Autowired private AccountPayableRepository accountPayableRepository;
    @Autowired private AccountReceivableRepository accountReceivableRepository;
    @Autowired private ActivityLogRepository activityLogRepository;

    @BeforeEach
    void criarDados() {
        // O contexto Spring (e o H2) é compartilhado entre os testes: cria a massa de dados uma vez só.
        if (dadosCriados) {
            return;
        }
        dadosCriados = true;

        Category massas = new Category();
        massas.setName("Massas (relatório)");
        categoryRepository.save(massas);

        Product farinha = produto("INS-001", "Farinha de trigo", ProductType.INSUMO, "12.50", null,
                UnitOfMeasure.KG, "5", "10000", "2000", massas);
        Product queijo = produto("INS-002", "Queijo muçarela", ProductType.INSUMO, "40.00", null,
                UnitOfMeasure.KG, "1", "500", "1000", massas);
        Product lasanha = produto("PF-001", "Lasanha à bolonhesa", ProductType.PRODUTO_FINAL, "15.00", "45.00",
                null, null, "10", "2", massas);

        TechnicalSheet ficha = new TechnicalSheet();
        ficha.setName("Lasanha à bolonhesa - receita");
        ficha.setFinalProduct(lasanha);
        ficha.setRendimento(1);
        ficha.setLabourCostPercent(new BigDecimal("30"));
        ficha.setVariableExpensesPercent(new BigDecimal("15"));
        ficha.setDesiredMarginPercent(new BigDecimal("30"));
        ficha.setItems(List.of(itemFicha(ficha, farinha, "250", UnitOfMeasure.G), itemFicha(ficha, queijo, "200", UnitOfMeasure.G)));
        technicalSheetRepository.save(ficha);

        Supplier fornecedor = new Supplier();
        fornecedor.setName("Atacadão Paranavaí");
        fornecedor.setCnpj("11222333000181");
        supplierRepository.save(fornecedor);

        Person cliente = new Person();
        cliente.setName("Maria da Silva");
        personRepository.save(cliente);

        Purchase compra = new Purchase();
        compra.setDate(LocalDate.now());
        compra.setSupplier(fornecedor);
        compra.setPaymentMethod("PIX");
        compra.setTotal(new BigDecimal("25.00"));
        PurchaseItem itemCompra = new PurchaseItem();
        itemCompra.setProduct(farinha);
        itemCompra.setQuantity(new BigDecimal("2"));
        itemCompra.setUnitPrice(new BigDecimal("12.50"));
        itemCompra.setPurchase(compra);
        compra.getItems().add(itemCompra);
        purchaseRepository.save(compra);

        venda(cliente, "PIX", 5, lasanha, "2", "85.00");
        venda(null, "DINHEIRO", 0, lasanha, "1", "45.00");

        movimento(farinha, StockMovement.MovementType.ENTRY, "10000", null, "Compra #1");
        movimento(lasanha, StockMovement.MovementType.EXIT, "3", null, "Venda #1");
        movimento(queijo, StockMovement.MovementType.LOSS, "100", LossReason.VENCIMENTO, "Queijo vencido");

        AccountPayable energia = new AccountPayable();
        energia.setDescription("Conta de energia");
        energia.setAmount(new BigDecimal("230.00"));
        energia.setDueDate(LocalDate.now().minusDays(3));
        energia.setStatus(AccountPayable.Status.PENDING);
        energia.setSupplier(fornecedor);
        accountPayableRepository.save(energia);

        AccountReceivable encomenda = new AccountReceivable();
        encomenda.setDescription("Encomenda de aniversário");
        encomenda.setAmount(new BigDecimal("300.00"));
        encomenda.setDueDate(LocalDate.now().plusDays(5));
        encomenda.setStatus(AccountReceivable.Status.PENDING);
        encomenda.setPerson(cliente);
        accountReceivableRepository.save(encomenda);

        ActivityLog log = new ActivityLog();
        log.setDataHora(LocalDateTime.now());
        log.setAcao("CRIAR_VENDA");
        log.setEntidade("Sale");
        log.setEntidadeId(1L);
        log.setDetalhes("Total: 85.00");
        log.setUsuarioNome("Administrador");
        activityLogRepository.save(log);
    }

    @ParameterizedTest(name = "GET /reports/pdf/{0}")
    @ValueSource(strings = {
            "sales", "top-selling-products", "monthly-revenue", "financial-flow", "accounts-payable",
            "accounts-receivable", "purchases", "stock-position", "stock-movement", "loss", "technical-sheets",
            "activity-log"
    })
    @DisplayName("Cada relatório gera um PDF válido")
    void geraPdf(String relatorio) throws Exception {
        byte[] pdf = baixar(relatorio);

        assertThat(new String(pdf, 0, 5)).isEqualTo("%PDF-");
        Files.createDirectories(SAIDA);
        Files.write(SAIDA.resolve(relatorio + ".pdf"), pdf);
    }

    @Test
    @DisplayName("Relatório de vendas traz totais e valores formatados em pt-BR")
    void vendas_conteudo() throws Exception {
        String texto = texto(baixar("sales"));

        assertThat(texto)
                .contains("Relatório de Vendas")
                .contains("R$ 130,00")      // faturamento: 85 + 45
                .contains("R$ 65,00")       // ticket médio
                .contains("Maria da Silva")
                .contains("Consumidor final")
                .contains("PIX");
    }

    @Test
    @DisplayName("Contas a pagar vencidas aparecem como vencidas, com dias de atraso")
    void contasAPagar_vencida() throws Exception {
        String texto = texto(baixar("accounts-payable"));

        assertThat(texto).contains("Conta de energia").contains("Vencida").contains("3 dia(s)");
    }

    @Test
    @DisplayName("Posição de estoque sinaliza produto abaixo do mínimo e calcula o valor estimado")
    void posicaoEstoque() throws Exception {
        String texto = texto(baixar("stock-position"));

        // Farinha: 10.000 g x (12,50 / 5.000 g) = R$ 25,00
        assertThat(texto).contains("Queijo muçarela").contains("Repor").contains("R$ 25,00");
    }

    @Test
    @DisplayName("Fichas técnicas mostram preço sugerido pelo markup divisor")
    void fichasTecnicas() throws Exception {
        String texto = texto(baixar("technical-sheets"));

        // Ingredientes: 250 g farinha (0,625) + 200 g queijo (8,00) = 8,625; c/ MO 30% = 11,2125;
        // preço sugerido = 11,2125 / 0,55 = 20,39
        assertThat(texto).contains("Lasanha à bolonhesa").contains("R$ 20,39");
    }

    @Test
    @DisplayName("Período com data inicial depois da final é recusado com código de erro")
    void periodoInvertido() throws Exception {
        mockMvc.perform(get("/reports/pdf/sales")
                        .param("startDate", "2026-10-10")
                        .param("endDate", "2026-10-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-REPORT-001"));
    }

    @Test
    @WithMockUser(username = "operador@sigrest.local", roles = "OPERADOR")
    @DisplayName("Operador não acessa os relatórios em PDF")
    void operadorSemAcesso() throws Exception {
        mockMvc.perform(get("/reports/pdf/sales")
                        .param("startDate", inicio.toString())
                        .param("endDate", fim.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /reports/purchase-history devolve as compras do período")
    void historicoDeCompras() throws Exception {
        mockMvc.perform(get("/reports/purchase-history")
                        .param("startDate", inicio.toString())
                        .param("endDate", fim.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].supplierName", hasItem("Atacadão Paranavaí")));
    }

    // ================================ Apoio ================================

    private byte[] baixar(String relatorio) throws Exception {
        return mockMvc.perform(get("/reports/pdf/" + relatorio)
                        .param("startDate", inicio.toString())
                        .param("endDate", fim.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.startsWith("inline; filename=\"sigrest-")))
                .andReturn().getResponse().getContentAsByteArray();
    }

    private static String texto(byte[] pdf) throws Exception {
        try (PDDocument documento = PDDocument.load(pdf)) {
            return new PDFTextStripper().getText(documento);
        }
    }

    private Product produto(String codigo, String nome, ProductType tipo, String preco, String precoVenda,
                            UnitOfMeasure unidadeCompra, String qtdEmbalagem, String estoque, String minimo,
                            Category categoria) {
        Product p = new Product();
        p.setCode(codigo);
        p.setName(nome);
        p.setTipo(tipo);
        p.setPrice(new BigDecimal(preco));
        p.setSellPrice(precoVenda != null ? new BigDecimal(precoVenda) : null);
        p.setPurchaseUnit(unidadeCompra);
        p.setPackageQuantity(qtdEmbalagem != null ? new BigDecimal(qtdEmbalagem) : null);
        p.setStorage(new BigDecimal(estoque));
        p.setMinStorage(new BigDecimal(minimo));
        p.setCategory(categoria);
        return productRepository.save(p);
    }

    private static TechnicalSheetItem itemFicha(TechnicalSheet ficha, Product insumo, String quantidade, UnitOfMeasure unidade) {
        TechnicalSheetItem item = new TechnicalSheetItem();
        item.setTechnicalSheet(ficha);
        item.setRawMaterial(insumo);
        item.setQuantity(new BigDecimal(quantidade));
        item.setUnit(unidade);
        return item;
    }

    private void venda(Person cliente, String formaPagamento, int desconto, Product produto, String quantidade, String total) {
        Sale venda = new Sale();
        venda.setDate(new Date());
        venda.setPerson(cliente);
        venda.setPaymentMethod(formaPagamento);
        venda.setDiscount(BigDecimal.valueOf(desconto));
        venda.setTotal(new BigDecimal(total));
        SellItem item = new SellItem();
        item.setProduct(produto);
        item.setQuantity(new BigDecimal(quantidade));
        item.setUnitPrice(produto.getSellPrice());
        item.setSale(venda);
        venda.getItems().add(item);
        saleRepository.save(venda);
    }

    private void movimento(Product produto, StockMovement.MovementType tipo, String quantidade, LossReason motivo, String descricao) {
        StockMovement m = new StockMovement();
        m.setProduct(produto);
        m.setType(tipo);
        m.setQuantity(new BigDecimal(quantidade));
        m.setReason(motivo);
        m.setDate(LocalDateTime.now());
        m.setDescription(descricao);
        stockMovementRepository.save(m);
    }
}
