package br.com.sigrest.api.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Page Object for the Sale registration screen ({@code /sales/new}).
 *
 * <p>Wraps the {@code SaleForm} React component. A valid sale needs an open cash
 * register and a final product with stock — see {@code SigRestE2ETests}.
 */
public class SalePage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    // ---- Selectors -------------------------------------------------------
    private final By personSelect = By.cssSelector("[data-testid='sale-person']");
    private final By paymentSelect = By.cssSelector("[data-testid='sale-payment']");
    private final By discountInput = By.cssSelector("[data-testid='sale-discount']");
    private final By addItemButton = By.cssSelector("[data-testid='sale-add-item']");
    private final By productSelect = By.cssSelector("[data-testid='sale-item-product']");
    private final By quantityInput = By.cssSelector("[data-testid='sale-item-qty']");
    private final By submitButton = By.cssSelector("[data-testid='sale-submit']");
    private final By itemTotal = By.cssSelector("[data-testid='sale-item-total']");
    private final By successToast =
            By.xpath("//*[contains(text(),'Venda registrada com sucesso')]");

    public SalePage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        this.driver = driver;
        this.wait = wait;
        this.baseUrl = baseUrl;
    }

    /** Navigates to the new-sale page and waits for the client dropdown (optional field). */
    public SalePage open() {
        driver.get(baseUrl + "/sales/new");
        wait.until(ExpectedConditions.visibilityOfElementLocated(personSelect));
        return this;
    }

    /** Picks a payment method by its option value (e.g. DINHEIRO, PIX). */
    public SalePage selectPaymentMethod(String optionValue) {
        Select select = new Select(
                wait.until(ExpectedConditions.elementToBeClickable(paymentSelect)));
        select.selectByValue(optionValue);
        return this;
    }

    /** Adds an item row with the product whose option text contains the given name. */
    public SalePage addProduct(String productName, String quantity) {
        wait.until(ExpectedConditions.elementToBeClickable(addItemButton)).click();
        Select product = new Select(wait.until(ExpectedConditions.elementToBeClickable(productSelect)));
        product.getOptions().stream()
                .filter(option -> option.getText().contains(productName))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Product not found in the sale form: " + productName))
                .click();

        WebElement qty = wait.until(ExpectedConditions.visibilityOfElementLocated(quantityInput));
        qty.clear();
        qty.sendKeys(quantity);
        return this;
    }

    /** Text of the weight x price calculation shown on items sold by the kilo. */
    public String weighedItemTotal() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(itemTotal)).getText();
    }

    /** Applies a monetary discount to the sale. */
    public SalePage applyDiscount(String value) {
        WebElement discount = wait.until(ExpectedConditions.visibilityOfElementLocated(discountInput));
        discount.clear();
        discount.sendKeys(value);
        return this;
    }

    /** Submits the sale via the "Registrar Venda" button. */
    public void finalizeSale() {
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();
    }

    /** @return true when the success toast confirms the sale was registered. */
    public boolean isSaleSuccessful() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successToast)).isDisplayed();
    }

    /** Waits until the SPA redirects to the sales list after a successful sale. */
    public void waitForRedirectToList() {
        wait.until(ExpectedConditions.urlContains("/sales"));
    }
}