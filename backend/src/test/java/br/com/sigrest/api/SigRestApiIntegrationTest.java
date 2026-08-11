package br.com.sigrest.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("SigRest API - Integration Tests")
class SigRestApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // ========================== Context ==========================

    @Test
    @DisplayName("Spring context should load successfully")
    void contextLoads() {
        // passes if the application context starts without errors
    }

    // ========================== Swagger ==========================

    @Test
    @DisplayName("GET /v3/api-docs should return 200")
    void swaggerApiDocs_returns200() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
               .andExpect(status().isOk());
    }

    // ========================== Product ==========================

    @Test
    @DisplayName("GET /product should return 200")
    void getProducts_returns200() throws Exception {
        mockMvc.perform(get("/product"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /product/low-stock should return 200")
    void getLowStockProducts_returns200() throws Exception {
        mockMvc.perform(get("/product/low-stock"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /product without body should return 400")
    void postProduct_withoutBody_returns400() throws Exception {
        mockMvc.perform(post("/product")
               .contentType(MediaType.APPLICATION_JSON))
               .andExpect(status().isBadRequest());
    }

    // ========================== Category ==========================

    @Test
    @DisplayName("GET /category should return 200")
    void getCategories_returns200() throws Exception {
        mockMvc.perform(get("/category"))
               .andExpect(status().isOk());
    }

    // ========================== Supplier ==========================

    @Test
    @DisplayName("GET /supplier should return 200")
    void getSuppliers_returns200() throws Exception {
        mockMvc.perform(get("/supplier"))
               .andExpect(status().isOk());
    }

    // ========================== User ==========================

    @Test
    @DisplayName("GET /user should return 200")
    void getUsers_returns200() throws Exception {
        mockMvc.perform(get("/user"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /user/signup without body should return 400")
    void postSignup_withoutBody_returns400() throws Exception {
        mockMvc.perform(post("/user/signup")
               .contentType(MediaType.APPLICATION_JSON))
               .andExpect(status().isBadRequest());
    }

    // ========================== Person ==========================

    @Test
    @DisplayName("GET /person should return 200")
    void getPersons_returns200() throws Exception {
        mockMvc.perform(get("/person"))
               .andExpect(status().isOk());
    }

    // ========================== State / City / Address ==========================

    @Test
    @DisplayName("GET /state should return 200")
    void getStates_returns200() throws Exception {
        mockMvc.perform(get("/state"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /city should return 200")
    void getCities_returns200() throws Exception {
        mockMvc.perform(get("/city"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /address should return 200")
    void getAddresses_returns200() throws Exception {
        mockMvc.perform(get("/address"))
               .andExpect(status().isOk());
    }

    // ========================== Purchase & Sales ==========================

    @Test
    @DisplayName("GET /purchases should return 200")
    void getPurchases_returns200() throws Exception {
        mockMvc.perform(get("/purchases"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /sales should return 200")
    void getSales_returns200() throws Exception {
        mockMvc.perform(get("/sales"))
               .andExpect(status().isOk());
    }

    // ========================== Cash ==========================

    @Test
    @DisplayName("GET /cash-registers should return 200")
    void getCashRegisters_returns200() throws Exception {
        mockMvc.perform(get("/cash-registers"))
               .andExpect(status().isOk());
    }
}