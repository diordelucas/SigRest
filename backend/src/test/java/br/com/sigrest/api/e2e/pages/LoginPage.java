package br.com.sigrest.api.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Page Object for the login screen ({@code /login}).
 *
 * <p>Selectors rely on stable {@code data-testid} attributes added to the
 * React component, so they survive Tailwind/markup refactors.
 */
public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    // ---- Selectors -------------------------------------------------------
    private final By emailInput = By.cssSelector("[data-testid='login-email']");
    private final By passwordInput = By.cssSelector("[data-testid='login-password']");
    private final By submitButton = By.cssSelector("[data-testid='login-submit']");
    private final By errorBanner = By.xpath("//*[contains(text(),'Credenciais inválidas')]");

    public LoginPage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        this.driver = driver;
        this.wait = wait;
        this.baseUrl = baseUrl;
    }

    /** Navigates the browser to the login page and waits for the form to render. */
    public LoginPage open() {
        driver.get(baseUrl + "/login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        return this;
    }

    /**
     * Fills credentials and submits. Always waits for each element to be
     * interactable before acting (React render timing safety).
     */
    public void login(String email, String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput)).clear();
        driver.findElement(emailInput).sendKeys(email);

        driver.findElement(passwordInput).clear();
        driver.findElement(passwordInput).sendKeys(password);

        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();
    }

    /** Blocks until the SPA navigates away from /login to the given path. */
    public void waitForRedirect(String expectedPathFragment) {
        wait.until(ExpectedConditions.urlContains(expectedPathFragment));
    }

    /** @return true if the "invalid credentials" banner is visible. */
    public boolean hasError() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errorBanner)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}