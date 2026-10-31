package br.com.sigrest.api.e2e;

import br.com.sigrest.api.e2e.pages.CashRegisterPage;
import br.com.sigrest.api.e2e.pages.LoginPage;
import br.com.sigrest.api.e2e.pages.ProductPage;
import br.com.sigrest.api.e2e.pages.SaleDetailsPage;
import br.com.sigrest.api.e2e.pages.SalePage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end test suite for the critical flows of SigRest (Maju's Assados e Congelados).
 *
 * <p>Covered flows:
 * <ol>
 *   <li><b>Login</b> — valid credentials redirect to the dashboard.</li>
 *   <li><b>Product registration</b> — fill and persist a new product.</li>
 *   <li><b>Sale registration</b> — open the cash register, select the product, apply discount, finalize.</li>
 *   <li><b>Partial reversal</b> — return part of the sale and check the new status.</li>
 * </ol>
 *
 * <h3>Preconditions (must hold before running):</h3>
 * <ul>
 *   <li>Backend running on <code>http://localhost:8080</code>.</li>
 *   <li>Frontend running on <code>http://localhost:3000</code> (override with
 *       <code>-De2e.baseUrl=...</code>).</li>
 *   <li>An admin user: <code>admin@admin.com / admin123</code> by default (created by DataInitializer),
 *       or <code>-De2e.adminEmail=... -De2e.adminPassword=...</code>.</li>
 *   <li>At least one <b>Category</b> registered — required by the product form.</li>
 * </ul>
 *
 * <p>Methods are ordered: the product is created, sold and then partially returned.
 * Run with: <code>mvn test -Pe2e</code>.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("SigRest - E2E Critical Flows")
class SigRestE2ETests extends BaseE2ETest {

    private static final String ADMIN_EMAIL = System.getProperty("e2e.adminEmail", "admin@admin.com");
    private static final String ADMIN_PASSWORD = System.getProperty("e2e.adminPassword", "admin123");

    /** Created by the product flow and consumed by the sale flow (JUnit creates one instance per test). */
    private static String createdProductName;

    /** Logs in as admin; shared by every flow since all routes are protected. */
    private void loginAsAdmin() {
        new LoginPage(driver, wait, BASE_URL)
                .open()
                .login(ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    @Test
    @Order(1)
    @DisplayName("Login: credenciais válidas redirecionam para o Dashboard")
    void shouldLoginAndRedirectToDashboard() {
        LoginPage loginPage = new LoginPage(driver, wait, BASE_URL).open();
        loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

        loginPage.waitForRedirect("/dashboard");

        assertTrue(driver.getCurrentUrl().contains("/dashboard"),
                "Após o login válido o usuário deve ser redirecionado para o Dashboard.");
    }

    @Test
    @Order(2)
    @DisplayName("Produto: cadastrar novo produto com sucesso")
    void shouldRegisterNewProduct() {
        loginAsAdmin();
        new LoginPage(driver, wait, BASE_URL).waitForRedirect("/dashboard");

        // Unique suffix avoids collisions with previously persisted products.
        String suffix = String.valueOf(System.currentTimeMillis() % 100000);

        ProductPage productPage = new ProductPage(driver, wait, BASE_URL).open();
        productPage.fillForm(
                createdProductName = "Frango Assado E2E " + suffix, // name
                "E2E-" + suffix,               // code
                "1500",                        // cost price (digits, read as cents)
                "2990",                        // sell price (digits, read as cents)
                "50",                          // current stock
                "10"                           // minimum stock
        );
        productPage.save();

        assertTrue(productPage.isSaveSuccessful(),
                "O toast de sucesso deve confirmar o cadastro do produto.");
    }

    @Test
    @Order(3)
    @DisplayName("Venda: registrar venda com desconto e forma de pagamento")
    void shouldRegisterSale() {
        loginAsAdmin();
        new LoginPage(driver, wait, BASE_URL).waitForRedirect("/dashboard");
        new CashRegisterPage(driver, wait, BASE_URL).ensureOpen("10000");

        SalePage salePage = new SalePage(driver, wait, BASE_URL).open();
        salePage.selectPaymentMethod("DINHEIRO")
                .addProduct(createdProductName, "2")
                .applyDiscount("5.00")
                .finalizeSale();

        assertTrue(salePage.isSaleSuccessful(),
                "O toast de sucesso deve confirmar o registro da venda.");
    }

    @Test
    @Order(4)
    @DisplayName("Estorno: devolver parte da venda deixa a situação como estorno parcial")
    void shouldPartiallyReverseSale() {
        loginAsAdmin();
        new LoginPage(driver, wait, BASE_URL).waitForRedirect("/dashboard");

        SaleDetailsPage details = new SaleDetailsPage(driver, wait, BASE_URL)
                .openNewestSale()
                .reverseFirstItem("1", "Cliente devolveu uma unidade");

        assertTrue(details.hasStatus("ESTORNO PARCIAL"),
                "A venda deve ficar como estorno parcial depois de devolver só parte dos itens.");
    }

    @Test
    @Order(5)
    @DisplayName("Venda por peso: cadastrar produto por quilo e vender 1,355 kg")
    void shouldSellByWeight() {
        loginAsAdmin();
        new LoginPage(driver, wait, BASE_URL).waitForRedirect("/dashboard");

        String suffix = String.valueOf(System.currentTimeMillis() % 100000);
        String name = "Lasanha Por Quilo E2E " + suffix;
        ProductPage productPage = new ProductPage(driver, wait, BASE_URL).open();
        productPage.fillForm(name, "KG-" + suffix, "1500", "3990", "5", "1").soldByKilo();
        productPage.save();
        assertTrue(productPage.isSaveSuccessful(), "O produto por quilo deve ser cadastrado.");

        new CashRegisterPage(driver, wait, BASE_URL).ensureOpen("10000");
        SalePage salePage = new SalePage(driver, wait, BASE_URL).open();
        salePage.selectPaymentMethod("PIX").addProduct(name, "1.355");
        assertTrue(salePage.weighedItemTotal().contains("54,06"),
                "1,355 kg a R$ 39,90 deve dar R$ 54,06: " + salePage.weighedItemTotal());
        salePage.finalizeSale();

        assertTrue(salePage.isSaleSuccessful(), "A venda por peso deve ser registrada.");
    }
}