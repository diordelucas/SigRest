package br.com.sigrest.api.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Page Object for the Product registration screen ({@code /products}).
 *
 * <p>Wraps the {@code ProductForm} React component. All interactions wait
 * explicitly for elements, because the form only renders after its data load.
 */
public class ProductPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    // ---- Selectors -------------------------------------------------------
    private final By nameInput = By.cssSelector("[data-testid='product-name']");
    private final By codeInput = By.cssSelector("[data-testid='product-code']");
    private final By priceInput = By.cssSelector("[data-testid='product-price']");
    private final By sellPriceInput = By.cssSelector("[data-testid='product-sellprice']");
    private final By storageInput = By.cssSelector("[data-testid='product-storage']");
    private final By minStorageInput = By.cssSelector("[data-testid='product-minstorage']");
    private final By submitButton = By.cssSelector("[data-testid='product-submit']");
    private final By successToast =
            By.xpath("//*[contains(text(),'Produto cadastrado com sucesso')]");

    public ProductPage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        this.driver = driver;
        this.wait = wait;
        this.baseUrl = baseUrl;
    }

    /** Navigates to the Products page and waits for the form to be ready. */
    public ProductPage open() {
        driver.get(baseUrl + "/products");
        wait.until(ExpectedConditions.visibilityOfElementLocated(nameInput));
        return this;
    }

    /** Fills the whole product form with the supplied values. */
    public ProductPage fillForm(String name, String code, String costPrice,
                                String sellPrice, String storage, String minStorage) {
        type(nameInput, name);
        type(codeInput, code);
        type(priceInput, costPrice);
        type(sellPriceInput, sellPrice);
        type(storageInput, storage);
        type(minStorageInput, minStorage);
        return this;
    }

    /** Submits the form via the "Cadastrar" button. */
    public void save() {
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();
    }

    /** @return true when the success toast appears, confirming persistence. */
    public boolean isSaveSuccessful() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successToast)).isDisplayed();
    }

    // ---- Internal helper -------------------------------------------------
    private void type(By locator, String value) {
        var el = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        el.clear();
        el.sendKeys(value);
    }
}