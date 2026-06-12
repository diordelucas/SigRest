package br.com.sigrest.api.e2e;

import br.com.sigrest.api.e2e.pages.LoginPage;
import br.com.sigrest.api.e2e.pages.ProductPage;
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
 *   <li><b>Sale registration</b> — select client/product, apply discount, finalize.</li>
 * </ol>
 *
 * <h3>Preconditions (must hold before running):</h3>
 * <ul>
 *   <li>Backend running on <code>http://localhost:8080</code>.</li>
 *   <li>Frontend running on <code>http://localhost:3000</code> (override with
 *       <code>-De2e.baseUrl=...</code>).</li>
 *   <li>Admin user seeded: <code>admin@admin.com / admin123</code> (created by DataInitializer).</li>
 *   <li>At least one <b>Person</b> registered — required by the sale flow's client dropdown.</li>
 * </ul>
 *
 * <p>Methods are ordered so the product is created before the sale that may consume it.
 * Run with: <code>mvn test -Dgroups=e2e</code>.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("SigRest - E2E Critical Flows")
class SigRestE2ETests extends BaseE2ETest {

    private static final String ADMIN_EMAIL = "admin@admin.com";
    private static final String ADMIN_PASSWORD = "admin123";

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

        // Unique suffix avoids collisions with previously persisted products.
        String suffix = String.valueOf(System.currentTimeMillis() % 100000);

        ProductPage productPage = new ProductPage(driver, wait, BASE_URL).open();
        productPage.fillForm(
                "Frango Assado E2E " + suffix, // name
                "E2E-" + suffix,               // code
                "15.00",                       // cost price
                "29.90",                       // sell price
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

        SalePage salePage = new SalePage(driver, wait, BASE_URL).open();
        salePage.selectFirstClient()
                .selectPaymentMethod("DINHEIRO")
                .addFirstProduct("2")
                .applyDiscount("5.00")
                .finalizeSale();

        assertTrue(salePage.isSaleSuccessful(),
                "O toast de sucesso deve confirmar o registro da venda.");
    }
}