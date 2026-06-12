package br.com.sigrest.api.e2e;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * Base class for all Selenium WebDriver E2E tests.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Bootstraps the ChromeDriver binary automatically via WebDriverManager.</li>
 *   <li>Creates a fresh, isolated browser session for every test ({@code @BeforeEach}).</li>
 *   <li>Closes the browser after every test ({@code @AfterEach}) to avoid leaks.</li>
 * </ul>
 *
 * <p>Configuration via system properties (all optional):
 * <ul>
 *   <li>{@code -De2e.baseUrl=http://localhost:3000} — frontend URL under test.</li>
 *   <li>{@code -De2e.headless=true} — run Chrome without a visible window (CI mode).</li>
 * </ul>
 *
 * <p>Tagged {@code "e2e"} so it is excluded from the normal {@code mvn test} build.
 * Run explicitly with {@code mvn test -Dgroups=e2e}.
 */
@Tag("e2e")
public abstract class BaseE2ETest {

    /** Base URL of the running React frontend. Override with -De2e.baseUrl=... */
    protected static final String BASE_URL =
            System.getProperty("e2e.baseUrl", "http://localhost:3000");

    /** Implicit wait applied to every element lookup as a safety net. */
    private static final Duration IMPLICIT_WAIT = Duration.ofSeconds(10);

    /** Default timeout used by explicit waits in the Page Objects. */
    protected static final Duration EXPLICIT_WAIT = Duration.ofSeconds(15);

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeEach
    void setUp() {
        // Resolves and caches the correct chromedriver for the installed Chrome version.
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        if (Boolean.getBoolean("e2e.headless")) {
            options.addArguments("--headless=new");
            options.addArguments("--window-size=1920,1080");
        }
        // Flags that keep Chrome stable when launched from CI / containers.
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(IMPLICIT_WAIT);

        wait = new WebDriverWait(driver, EXPLICIT_WAIT);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}