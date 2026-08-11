package br.com.sigrest.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * "Excluir" categoria (e produto/cliente/fornecedor, mesmo mecanismo) nunca
 * remove a linha do banco: so desativa. A entidade some da listagem, mas
 * continua acessivel por id — e e isso que este teste prova.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "test-admin@sigrest.local", roles = "ADMIN")
@DisplayName("Soft delete - categoria nao e removida fisicamente")
class SoftDeleteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("DELETE /category/{id} desativa em vez de remover: some da lista, continua acessivel por id")
    void deleteCategory_deactivatesInsteadOfRemoving() throws Exception {
        String payload = objectMapper.writeValueAsString(
                new java.util.HashMap<>(java.util.Map.of("name", "Categoria de teste", "description", "criada pelo teste")));

        String createdJson = mockMvc.perform(post("/category")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andReturn().getResponse().getContentAsString();

        // POST /category não devolve corpo hoje: localizamos o registro criado pela lista.
        JsonNode list = objectMapper.readTree(mockMvc.perform(get("/category"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        JsonNode created = null;
        for (JsonNode node : list) {
            if ("Categoria de teste".equals(node.get("name").asText())) {
                created = node;
            }
        }
        assertThat(created).as("categoria recem-criada deveria aparecer na listagem").isNotNull();
        long id = created.get("id").asLong();

        mockMvc.perform(delete("/category/" + id)).andExpect(status().isOk());

        JsonNode listAfterDelete = objectMapper.readTree(mockMvc.perform(get("/category"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        boolean stillListed = false;
        for (JsonNode node : listAfterDelete) {
            if (node.get("id").asLong() == id) {
                stillListed = true;
            }
        }
        assertThat(stillListed).as("categoria excluida nao deveria aparecer mais na listagem").isFalse();

        // Continua existindo no banco (nao foi removida): PUT sobre o id ainda encontra o registro.
        String updatePayload = objectMapper.writeValueAsString(
                new java.util.HashMap<>(java.util.Map.of("name", "Categoria de teste renomeada", "description", "")));
        mockMvc.perform(put("/category/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk());
    }
}
