package br.com.sigrest.api.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/** Page Object for the sale details screen ({@code /sales/:id}), where sales are reversed. */
public class SaleDetailsPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    // ---- Selectors -------------------------------------------------------
    private final By firstDetailsButton = By.xpath("(//button[normalize-space()='Ver Detalhes'])[1]");
    private final By reverseButton = By.cssSelector("[data-testid='sale-reverse-open']");
    private final By firstQuantityInput = By.cssSelector("[data-testid='sale-reversal-qty-0']");
    private final By reasonInput = By.cssSelector("[data-testid='sale-reversal-reason']");
    private final By confirmButton = By.xpath("//button[normalize-space()='Estornar']");
    private final By statusBadge = By.cssSelector("[data-testid='sale-status']");

    public SaleDetailsPage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        this.driver = driver;
        this.wait = wait;
        this.baseUrl = baseUrl;
    }

    /** The sales list shows the newest sale first. */
    public SaleDetailsPage openNewestSale() {
        driver.get(baseUrl + "/sales");
        wait.until(ExpectedConditions.elementToBeClickable(firstDetailsButton)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(reverseButton));
        return this;
    }

    /** Reverses part of the first item of the sale. */
    public SaleDetailsPage reverseFirstItem(String quantity, String reason) {
        wait.until(ExpectedConditions.elementToBeClickable(reverseButton)).click();
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(firstQuantityInput));
        input.clear();
        input.sendKeys(quantity);
        driver.findElement(reasonInput).sendKeys(reason);
        wait.until(ExpectedConditions.elementToBeClickable(confirmButton)).click();
        return this;
    }

    /** Waits until the status badge shows the given label. */
    public boolean hasStatus(String label) {
        return wait.until(ExpectedConditions.textToBePresentInElementLocated(statusBadge, label));
    }
}
