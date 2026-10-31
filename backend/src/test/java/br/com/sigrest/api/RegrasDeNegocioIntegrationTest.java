package br.com.sigrest.api;

import br.com.sigrest.api.entity.Category;
import br.com.sigrest.api.entity.Product;
import br.com.sigrest.api.entity.ProductType;
import br.com.sigrest.api.entity.StockMovement;
import br.com.sigrest.api.entity.Supplier;
import br.com.sigrest.api.entity.UnitOfMeasure;
import br.com.sigrest.api.entity.User;
import br.com.sigrest.api.repository.CashRegisterRepository;
import br.com.sigrest.api.repository.CategoryRepository;
import br.com.sigrest.api.repository.ProductRepository;
import br.com.sigrest.api.repository.StockMovementRepository;
import br.com.sigrest.api.repository.SupplierRepository;
import br.com.sigrest.api.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regras corrigidas na validação completa do sistema: vendas, estorno, caixa, produção, cadastros e permissões.
 * Usa um banco H2 próprio: as vendas criadas aqui não podem entrar nas contas de ReportPdfIntegrationTest.
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:sigrest_regras_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
@AutoConfigureMockMvc
@DisplayName("Regras de negócio")
class RegrasDeNegocioIntegrationTest {

    private static final AtomicInteger SEQ = new AtomicInteger();

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private CashRegisterRepository cashRegisterRepository;
    @Autowired private StockMovementRepository stockMovementRepository;

    private User admin;
    private User operador;
    private Category categoria;

    @BeforeEach
    void preparar() {
        admin = usuario("admin-regras@teste.local", "ADMIN");
        operador = usuario("operador-regras@teste.local", "OPERADOR");
        Category nova = new Category();
        nova.setName("Categoria regras " + SEQ.incrementAndGet());
        categoria = categoryRepository.save(nova);
    }

    private User usuario(String email, String role) {
        return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setName(role + " de teste");
            user.setPassword(passwordEncoder.encode("senha-original"));
            user.setRole(role);
            return userRepository.save(user);
        });
    }

    private RequestPostProcessor como(User user) {
        return authentication(new UsernamePasswordAuthenticationToken(user, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))));
    }

    private MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, Object body) throws Exception {
        return request.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body));
    }

    private String sufixo() {
        return String.valueOf(SEQ.incrementAndGet());
    }

    private Product produtoFinal(String estoque) {
        Product p = new Product();
        p.setName("Marmita " + sufixo());
        p.setCode("MAR-" + sufixo());
        p.setCategory(categoria);
        p.setTipo(ProductType.PRODUTO_FINAL);
        p.setPrice(new BigDecimal("5.00"));
        p.setSellPrice(new BigDecimal("20.00"));
        p.setStorage(new BigDecimal(estoque));
        p.setMinStorage(BigDecimal.ZERO);
        return productRepository.save(p);
    }

    private Product insumo(UnitOfMeasure unidade, String embalagem, String preco, String estoque) {
        Product p = new Product();
        p.setName("Insumo " + sufixo());
        p.setCode("INS-" + sufixo());
        p.setCategory(categoria);
        p.setTipo(ProductType.INSUMO);
        p.setPurchaseUnit(unidade);
        p.setPackageQuantity(new BigDecimal(embalagem));
        p.setPrice(new BigDecimal(preco));
        p.setSellPrice(BigDecimal.ZERO);
        p.setStorage(new BigDecimal(estoque));
        p.setMinStorage(BigDecimal.ZERO);
        return productRepository.save(p);
    }

    private void fecharCaixaAberto() throws Exception {
        var aberto = cashRegisterRepository.findByIsOpenTrue();
        if (aberto.isPresent()) {
            mockMvc.perform(post("/cash-registers/close/" + aberto.get().getId()).with(como(admin)))
                    .andExpect(status().isOk());
        }
    }

    private long abrirCaixa() throws Exception {
        fecharCaixaAberto();
        String resposta = mockMvc.perform(json(post("/cash-registers/open"), Map.of("openingBalance", 100)).with(como(admin)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private JsonNode caixa(long id) throws Exception {
        return objectMapper.readTree(mockMvc.perform(get("/cash-registers/" + id).with(como(admin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
    }

    private Map<String, Object> venda(Product produto, String pagamento, Object desconto, int quantidade, String preco) {
        return Map.of("paymentMethod", pagamento, "discount", desconto,
                "items", List.of(Map.of("productId", produto.getId(), "quantity", quantidade, "unitPrice", new BigDecimal(preco))));
    }

    private JsonNode vender(Map<String, Object> corpo) throws Exception {
        return objectMapper.readTree(mockMvc.perform(json(post("/sales"), corpo).with(como(admin)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());
    }

    private BigDecimal estoque(Product produto) {
        return productRepository.findById(produto.getId()).orElseThrow().getStorage();
    }

    // ================================ Vendas ================================

    @Test
    @DisplayName("Venda sem caixa aberto é recusada")
    void vendaSemCaixaAberto() throws Exception {
        fecharCaixaAberto();
        mockMvc.perform(json(post("/sales"), venda(produtoFinal("5"), "DINHEIRO", 0, 1, "20.00")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-CASH-003"));
    }

    @Test
    @DisplayName("Desconto maior que o subtotal é recusado e não gera venda negativa")
    void descontoMaiorQueSubtotal() throws Exception {
        abrirCaixa();
        Product produto = produtoFinal("5");
        mockMvc.perform(json(post("/sales"), venda(produto, "PIX", 100, 1, "20.00")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-SALE-002"));
        assertThat(estoque(produto)).isEqualByComparingTo("5");
    }

    @Test
    @DisplayName("Desconto com centavos é gravado inteiro")
    void descontoComCentavos() throws Exception {
        abrirCaixa();
        JsonNode resposta = vender(venda(produtoFinal("5"), "DINHEIRO", new BigDecimal("7.80"), 3, "20.00"));
        assertThat(resposta.get("discount").decimalValue()).isEqualByComparingTo("7.80");
        assertThat(resposta.get("total").decimalValue()).isEqualByComparingTo("52.20");
    }

    @Test
    @DisplayName("Insumo não pode ser vendido, e preço zero é recusado")
    void insumoNaoEVendido() throws Exception {
        abrirCaixa();
        mockMvc.perform(json(post("/sales"), venda(insumo(UnitOfMeasure.KG, "1", "10.00", "1000"), "PIX", 0, 1, "5.00")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-SALE-003"));
        mockMvc.perform(json(post("/sales"), venda(produtoFinal("5"), "PIX", 0, 1, "0")).with(como(admin)))
                .andExpect(status().isBadRequest());
    }

    // ================================ Estorno ================================

    @Test
    @DisplayName("Estorno devolve o estoque, tira o dinheiro do caixa e não pode ser repetido")
    void estornoCompleto() throws Exception {
        long caixaId = abrirCaixa();
        Product produto = produtoFinal("5");
        long vendaId = vender(venda(produto, "DINHEIRO", 0, 2, "20.00")).get("id").asLong();
        assertThat(estoque(produto)).isEqualByComparingTo("3");
        assertThat(caixa(caixaId).get("currentBalance").decimalValue()).isEqualByComparingTo("140.00");

        mockMvc.perform(json(post("/sales/" + vendaId + "/reversal"), Map.of("reason", "Cliente desistiu")).with(como(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVERSED"))
                .andExpect(jsonPath("$.reversalReason").value("Cliente desistiu"));

        assertThat(estoque(produto)).isEqualByComparingTo("5");
        assertThat(caixa(caixaId).get("currentBalance").decimalValue()).isEqualByComparingTo("100.00");

        mockMvc.perform(json(post("/sales/" + vendaId + "/reversal"), Map.of("reason", "De novo")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-SALE-004"));
    }

    @Test
    @DisplayName("Venda estornada sai do faturamento; operador não estorna; motivo é obrigatório")
    void estornoForaDoFaturamento() throws Exception {
        abrirCaixa();
        JsonNode antes = objectMapper.readTree(mockMvc.perform(get("/dashboard/summary").with(como(admin)))
                .andReturn().getResponse().getContentAsString());
        long vendaId = vender(venda(produtoFinal("5"), "PIX", 0, 1, "20.00")).get("id").asLong();

        mockMvc.perform(json(post("/sales/" + vendaId + "/reversal"), Map.of("reason", "x")).with(como(operador)))
                .andExpect(status().isForbidden());
        mockMvc.perform(json(post("/sales/" + vendaId + "/reversal"), Map.of("reason", " ")).with(como(admin)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(json(post("/sales/" + vendaId + "/reversal"), Map.of("reason", "Erro de digitação")).with(como(admin)))
                .andExpect(status().isOk());

        JsonNode depois = objectMapper.readTree(mockMvc.perform(get("/dashboard/summary").with(como(admin)))
                .andReturn().getResponse().getContentAsString());
        assertThat(depois.get("todayRevenue").decimalValue()).isEqualByComparingTo(antes.get("todayRevenue").decimalValue());
    }

    // ================================ Caixa ================================

    @Test
    @DisplayName("Saldo do caixa conta só dinheiro; PIX e cartão ficam à parte")
    void caixaContaSoDinheiro() throws Exception {
        long caixaId = abrirCaixa();
        Product produto = produtoFinal("10");
        vender(venda(produto, "DINHEIRO", 0, 1, "20.00"));
        vender(venda(produto, "PIX", 0, 1, "20.00"));
        vender(venda(produto, "CARTAO_CREDITO", 0, 1, "20.00"));

        JsonNode dados = caixa(caixaId);
        assertThat(dados.get("salesTotal").decimalValue()).isEqualByComparingTo("20.00");
        assertThat(dados.get("otherPaymentsTotal").decimalValue()).isEqualByComparingTo("40.00");
        assertThat(dados.get("currentBalance").decimalValue()).isEqualByComparingTo("120.00");
    }

    @Test
    @DisplayName("Compra entra só no caixa aberto no momento dela, mesmo com outro caixa no mesmo dia")
    void compraNaoEContadaDuasVezes() throws Exception {
        long primeiro = abrirCaixa();
        Supplier fornecedor = new Supplier();
        fornecedor.setName("Fornecedor regras " + sufixo());
        fornecedor = supplierRepository.save(fornecedor);
        Product produto = insumo(UnitOfMeasure.KG, "1", "10.00", "0");
        mockMvc.perform(json(post("/purchases"), Map.of(
                        "date", LocalDate.now().toString(), "supplierId", fornecedor.getId(),
                        "items", List.of(Map.of("productId", produto.getId(), "quantity", new BigDecimal("2.5"), "unitPrice", new BigDecimal("10.00")))))
                        .with(como(admin)))
                .andExpect(status().isCreated());
        // 2,5 embalagens de 1 kg = 2.500 g: compra fracionada não pode ser truncada.
        assertThat(estoque(produto)).isEqualByComparingTo("2500");
        assertThat(caixa(primeiro).get("purchasesTotal").decimalValue()).isEqualByComparingTo("25.00");

        long segundo = abrirCaixa();
        assertThat(caixa(segundo).get("purchasesTotal").decimalValue()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("Fechamento guarda o valor contado e calcula a diferença")
    void fechamentoComConferencia() throws Exception {
        long caixaId = abrirCaixa();
        mockMvc.perform(json(post("/cash-registers/close/" + caixaId), Map.of("countedBalance", new BigDecimal("95.50"))).with(como(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.closingBalance").value(100.0))
                .andExpect(jsonPath("$.countedBalance").value(95.5))
                .andExpect(jsonPath("$.difference").value(-4.5));
    }

    @Test
    @DisplayName("Pagamento pode ser desfeito: a conta reabre e o valor volta ao caixa")
    void desfazerPagamento() throws Exception {
        long caixaId = abrirCaixa();
        Supplier fornecedor = new Supplier();
        fornecedor.setName("Fornecedor contas " + sufixo());
        fornecedor = supplierRepository.save(fornecedor);
        String conta = mockMvc.perform(json(post("/accounts-payable"), Map.of("description", "Luz", "amount", new BigDecimal("30.00"),
                        "dueDate", LocalDate.now().toString(), "supplierId", fornecedor.getId())).with(como(admin)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long contaId = objectMapper.readTree(conta).get("id").asLong();

        mockMvc.perform(put("/accounts-payable/pay/" + contaId).with(como(admin))).andExpect(status().isOk());
        assertThat(caixa(caixaId).get("currentBalance").decimalValue()).isEqualByComparingTo("70.00");

        mockMvc.perform(put("/accounts-payable/undo-payment/" + contaId).with(como(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));
        assertThat(caixa(caixaId).get("currentBalance").decimalValue()).isEqualByComparingTo("100.00");

        mockMvc.perform(put("/accounts-payable/undo-payment/" + contaId).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-PAY-003"));
    }

    // ================================ Ficha técnica e produção ================================

    private long criarFicha(Product produtoFinal, Product ingrediente, String quantidade, String unidade, int rendimento) throws Exception {
        String resposta = mockMvc.perform(json(post("/technical-sheet"), Map.of(
                        "name", "Ficha " + sufixo(), "finalProductId", produtoFinal.getId(), "rendimento", rendimento,
                        "labourCostPercent", 30, "variableExpensesPercent", 10, "desiredMarginPercent", 20,
                        "items", List.of(Map.of("rawMaterialId", ingrediente.getId(), "quantity", new BigDecimal(quantidade), "unit", unidade))))
                        .with(como(admin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(resposta).get("id").asLong();
    }

    private long abrirOrdem(Product produtoFinal, int quantidade) throws Exception {
        String resposta = mockMvc.perform(json(post("/production-order"), Map.of("finalProductId", produtoFinal.getId(), "quantity", quantidade))
                        .with(como(admin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(resposta).get("id").asLong();
    }

    @Test
    @DisplayName("Produção debita os insumos proporcionalmente ao rendimento da receita")
    void producaoUsaRendimento() throws Exception {
        Product frango = insumo(UnitOfMeasure.KG, "1", "22.00", "2000");
        Product marmita = produtoFinal("0");
        criarFicha(marmita, frango, "1.5", "KG", 10);

        long ordem = abrirOrdem(marmita, 10);
        mockMvc.perform(post("/production-order/" + ordem + "/finish").with(como(admin))).andExpect(status().isOk());

        // 10 marmitas de uma receita que rende 10 consomem 1,5 kg, e não 15 kg.
        assertThat(estoque(frango)).isEqualByComparingTo("500");
        assertThat(estoque(marmita)).isEqualByComparingTo("10");
    }

    @Test
    @DisplayName("Quantidade real maior que a planejada é recusada")
    void realMaiorQuePlanejado() throws Exception {
        Product marmita = produtoFinal("0");
        criarFicha(marmita, insumo(UnitOfMeasure.KG, "1", "22.00", "5000"), "1", "KG", 10);
        long ordem = abrirOrdem(marmita, 2);
        mockMvc.perform(json(post("/production-order/" + ordem + "/finish"), Map.of("actualQuantity", 9)).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-PORD-007"));
        assertThat(estoque(marmita)).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("Preço sugerido é por porção, e não da receita inteira")
    void precoSugeridoPorPorcao() throws Exception {
        long ficha = criarFicha(produtoFinal("0"), insumo(UnitOfMeasure.KG, "1", "20.00", "0"), "1", "KG", 10);
        // Receita: R$ 20,00 + 30% de mão de obra = R$ 26,00. Porção: R$ 2,60. Markup: 2,60 / (1 - 0,30) = R$ 3,71.
        mockMvc.perform(get("/technical-sheet/" + ficha + "/calculate-cost").with(como(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.servingCostWithLabour").value(2.6))
                .andExpect(jsonPath("$.suggestedSellPrice").value(3.71));
    }

    @Test
    @DisplayName("Ficha recusa unidade incompatível e insumo como produto final")
    void fichaValidaUnidadeEProdutoFinal() throws Exception {
        Product frango = insumo(UnitOfMeasure.KG, "1", "22.00", "0");
        mockMvc.perform(json(post("/technical-sheet"), Map.of("name", "Errada", "finalProductId", produtoFinal("0").getId(), "rendimento", 1,
                        "items", List.of(Map.of("rawMaterialId", frango.getId(), "quantity", 1, "unit", "L")))).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-TECH-002"));
        mockMvc.perform(json(post("/technical-sheet"), Map.of("name", "Errada", "finalProductId", frango.getId(), "rendimento", 1,
                        "items", List.of(Map.of("rawMaterialId", insumo(UnitOfMeasure.UN, "1", "1.00", "0").getId(), "quantity", 1, "unit", "UN")))).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-TECH-003"));
    }

    @Test
    @DisplayName("Insumo usado em ficha técnica não pode ser excluído")
    void insumoEmUsoNaoEExcluido() throws Exception {
        Product frango = insumo(UnitOfMeasure.KG, "1", "22.00", "0");
        criarFicha(produtoFinal("0"), frango, "1", "KG", 1);
        mockMvc.perform(delete("/product/" + frango.getId()).with(como(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("SIGREST-PROD-004"));
    }

    // ================================ Cadastros ================================

    private Map<String, Object> corpoProduto(String code, String tipo) {
        return Map.of("name", "Produto " + sufixo(), "code", code, "price", 1, "sellPrice", 2, "storage", 0, "minStorage", 0,
                "categoryId", categoria.getId(), "tipo", tipo);
    }

    @Test
    @DisplayName("Código de produto duplicado é recusado, e insumo exige unidade de compra")
    void validacoesDeProduto() throws Exception {
        String codigo = "COD-" + sufixo();
        mockMvc.perform(json(post("/product"), corpoProduto(codigo, "PRODUTO_FINAL")).with(como(admin))).andExpect(status().isOk());
        mockMvc.perform(json(post("/product"), corpoProduto(codigo, "PRODUTO_FINAL")).with(como(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("SIGREST-PROD-003"));
        mockMvc.perform(json(post("/product"), corpoProduto("COD-" + sufixo(), "INSUMO")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-PROD-005"));
    }

    @Test
    @DisplayName("Editar o estoque do produto gera uma movimentação de ajuste")
    void ajusteDeEstoqueRastreado() throws Exception {
        Product produto = produtoFinal("17");
        mockMvc.perform(json(put("/product/" + produto.getId()), Map.of("name", produto.getName(), "code", produto.getCode(),
                        "price", 5, "sellPrice", 20, "storage", 20, "minStorage", 0, "categoryId", categoria.getId(), "tipo", "PRODUTO_FINAL"))
                        .with(como(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storage").value(20));
        List<StockMovement> movimentos = stockMovementRepository.findAll().stream()
                .filter(m -> m.getProduct().getId().equals(produto.getId()))
                .toList();
        assertThat(movimentos).hasSize(1);
        assertThat(movimentos.get(0).getType()).isEqualTo(StockMovement.MovementType.ENTRY);
        assertThat(movimentos.get(0).getQuantity()).isEqualByComparingTo("3");
    }

    @Test
    @DisplayName("Categoria duplicada ou com produto ativo é recusada")
    void validacoesDeCategoria() throws Exception {
        mockMvc.perform(json(post("/category"), Map.of("name", categoria.getName().toUpperCase())).with(como(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("SIGREST-CAT-002"));
        produtoFinal("0");
        mockMvc.perform(delete("/category/" + categoria.getId()).with(como(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("SIGREST-CAT-003"));
    }

    @Test
    @DisplayName("Telefone incompleto e UF inexistente são recusados")
    void telefoneEUf() throws Exception {
        mockMvc.perform(json(post("/supplier"), Map.of("name", "Fornecedor", "phone", "11")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-GEN-005"));
        mockMvc.perform(json(post("/supplier"), Map.of("name", "Fornecedor", "uf", "99")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-GEO-004"));
    }

    @Test
    @DisplayName("Mensagem de validação não expõe o nome técnico do campo")
    void mensagemSemNomeTecnico() throws Exception {
        mockMvc.perform(json(post("/product"), Map.of("name", "")).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("price:"))))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Informe o preço de custo")));
    }

    // ================================ Usuários ================================

    @Test
    @DisplayName("E-mail repetido é recusado, sem diferenciar maiúsculas")
    void emailDuplicado() throws Exception {
        String email = "unico" + sufixo() + "@teste.local";
        Map<String, Object> corpo = Map.of("name", "Fulano", "email", email, "password", "segredo1", "role", "OPERADOR");
        mockMvc.perform(json(post("/user/signup"), corpo).with(como(admin))).andExpect(status().isOk());
        mockMvc.perform(json(post("/user/signup"), Map.of("name", "Outro", "email", email.toUpperCase(), "password", "segredo1", "role", "OPERADOR")).with(como(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("SIGREST-USER-003"));
        mockMvc.perform(json(post("/user/login"), Map.of("email", email.toUpperCase(), "password", "segredo1")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Administrador edita usuário; senha em branco mantém a atual")
    void editarUsuario() throws Exception {
        User alvo = usuario("editar" + sufixo() + "@teste.local", "OPERADOR");
        mockMvc.perform(json(put("/user/" + alvo.getId()), Map.of("name", "Novo Nome", "email", alvo.getEmail(), "role", "ADMIN")).with(como(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Novo Nome"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
        mockMvc.perform(json(post("/user/login"), Map.of("email", alvo.getEmail(), "password", "senha-original")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Usuário troca a própria senha informando a atual")
    void trocarSenha() throws Exception {
        User alvo = usuario("senha" + sufixo() + "@teste.local", "OPERADOR");
        mockMvc.perform(json(put("/user/me/password"), Map.of("currentPassword", "errada", "newPassword", "nova-senha")).with(como(alvo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-USER-004"));
        mockMvc.perform(json(put("/user/me/password"), Map.of("currentPassword", "senha-original", "newPassword", "nova-senha")).with(como(alvo)))
                .andExpect(status().isNoContent());
        mockMvc.perform(json(post("/user/login"), Map.of("email", alvo.getEmail(), "password", "nova-senha")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Usuário não exclui a si mesmo")
    void naoExcluiASiMesmo() throws Exception {
        mockMvc.perform(delete("/user/" + admin.getId()).with(como(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SIGREST-USER-005"));
    }

    // ================================ Permissões ================================

    @Test
    @DisplayName("Operador não grava clientes, fornecedores, categorias, produtos nem fichas")
    void operadorNaoGravaCadastros() throws Exception {
        mockMvc.perform(json(post("/person"), Map.of("name", "Cliente")).with(como(operador))).andExpect(status().isForbidden());
        mockMvc.perform(delete("/person/999999").with(como(operador))).andExpect(status().isForbidden());
        mockMvc.perform(json(post("/supplier"), Map.of("name", "Fornecedor")).with(como(operador))).andExpect(status().isForbidden());
        mockMvc.perform(delete("/supplier/999999").with(como(operador))).andExpect(status().isForbidden());
        mockMvc.perform(json(post("/category"), Map.of("name", "Categoria")).with(como(operador))).andExpect(status().isForbidden());
        mockMvc.perform(delete("/category/999999").with(como(operador))).andExpect(status().isForbidden());
        mockMvc.perform(json(post("/product"), corpoProduto("OP-" + sufixo(), "PRODUTO_FINAL")).with(como(operador))).andExpect(status().isForbidden());
        mockMvc.perform(get("/dashboard/summary").with(como(operador))).andExpect(status().isForbidden());
    }

    // ================================ Banco real ================================

    @Test
    @DisplayName("A migration aceita todos os tipos de movimentação de estoque (os testes rodam em H2, sem Flyway)")
    void migrationAceitaTodosOsTipos() throws Exception {
        try (InputStream migration = getClass().getResourceAsStream("/db/migration/V4__correcoes_validacao.sql")) {
            String sql = new String(migration.readAllBytes(), StandardCharsets.UTF_8);
            for (StockMovement.MovementType tipo : StockMovement.MovementType.values()) {
                assertThat(sql).contains("'" + tipo.name() + "'");
            }
        }
    }
}
