package br.com.sigrest.api.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Page Object for the cash register screen ({@code /cash-registers}).
 *
 * <p>Sales are refused while no cash register is open, so the sale flows call
 * {@link #ensureOpen(String)} first.
 */
public class CashRegisterPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    // ---- Selectors -------------------------------------------------------
    private final By openingBalanceInput = By.cssSelector("[data-testid='cash-opening-balance']");
    private final By openButton = By.cssSelector("[data-testid='cash-open-submit']");
    private final By confirmButton = By.xpath("//button[normalize-space()='Confirmar']");
    private final By openBalance = By.xpath("//*[contains(text(),'Saldo Atual do Caixa')]");

    public CashRegisterPage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        this.driver = driver;
        this.wait = wait;
        this.baseUrl = baseUrl;
    }

    /** Opens the cash register with the given balance, unless one is already open. */
    public void ensureOpen(String openingBalance) {
        driver.get(baseUrl + "/cash-registers");
        new WebDriverWait(driver, Duration.ofSeconds(20)).until(ExpectedConditions.or(
                ExpectedConditions.visibilityOfElementLocated(openBalance),
                ExpectedConditions.visibilityOfElementLocated(openingBalanceInput)));
        if (!driver.findElements(openBalance).isEmpty()) {
            return;
        }
        driver.findElement(openingBalanceInput).sendKeys(openingBalance);
        wait.until(ExpectedConditions.elementToBeClickable(openButton)).click();
        wait.until(ExpectedConditions.elementToBeClickable(confirmButton)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(openBalance));
    }
}
