package br.com.sigrest.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("SigRest API")
                .description("API REST do sistema de gestão de restaurante SigRest, especializado em " +
                    "refeições congeladas, marmitas e encomendas. Centraliza cadastros de clientes, " +
                    "controle de estoque, ordens de produção, compras, vendas e relatórios gerenciais.")
                .version("1.0.0")
            );
    }
}
