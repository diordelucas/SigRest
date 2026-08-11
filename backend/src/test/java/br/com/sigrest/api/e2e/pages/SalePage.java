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
 * <p>Wraps the {@code SaleForm} React component. A valid sale needs at least
 * one registered person (client) and one product in the database — see the
 * preconditions documented in {@code SigRestE2ETests}.
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
    private final By successToast =
            By.xpath("//*[contains(text(),'Venda registrada com sucesso')]");

    public SalePage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        this.driver = driver;
        this.wait = wait;
        this.baseUrl = baseUrl;
    }

    /** Navigates to the new-sale page and waits for the client dropdown. */
    public SalePage open() {
        driver.get(baseUrl + "/sales/new");
        wait.until(ExpectedConditions.visibilityOfElementLocated(personSelect));
        return this;
    }

    /** Selects the first real client option (index 0 is the placeholder). */
    public SalePage selectFirstClient() {
        selectFirstRealOption(personSelect);
        return this;
    }

    /** Picks a payment method by its option value (e.g. DINHEIRO, PIX). */
    public SalePage selectPaymentMethod(String optionValue) {
        Select select = new Select(
                wait.until(ExpectedConditions.elementToBeClickable(paymentSelect)));
        select.selectByValue(optionValue);
        return this;
    }

    /** Adds an empty item row and selects the first available product in it. */
    public SalePage addFirstProduct(String quantity) {
        wait.until(ExpectedConditions.elementToBeClickable(addItemButton)).click();
        selectFirstRealOption(productSelect);

        WebElement qty = wait.until(ExpectedConditions.visibilityOfElementLocated(quantityInput));
        qty.clear();
        qty.sendKeys(quantity);
        return this;
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

    // ---- Internal helper -------------------------------------------------

    /**
     * Selects the first non-placeholder option of a {@code <select>}.
     * The forms render index 0 as a "Selecione..." placeholder, so we use index 1.
     */
    private void selectFirstRealOption(By locator) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
        Select select = new Select(element);
        // Guard: ensure the dropdown actually has a selectable option beyond the placeholder.
        if (select.getOptions().size() < 2) {
            throw new IllegalStateException(
                    "Dropdown " + locator + " has no selectable data option. "
                            + "Seed at least one record before running this test.");
        }
        select.selectByIndex(1);
    }
}