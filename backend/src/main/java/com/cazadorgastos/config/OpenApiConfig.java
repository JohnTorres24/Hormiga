package com.cazadorgastos.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cazadorOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Cazador de Gastos Hormiga")
                        .version("1.0.0")
                        .description("Documentación interactiva de la API REST para el control de suscripciones, gastos hormiga, análisis financiero multi-moneda (COP/USD) y alertas pre-cobro a 48 horas.")
                        .contact(new Contact()
                                .name("Cazador de Gastos Hormiga")
                                .email("soporte@cazadorgastos.com")))
                .servers(List.of(
                        new Server().url("https://cazador-gastos-hormiga-api.onrender.com").description("Servidor de Producción (Render Nube)"),
                        new Server().url("http://localhost:4000").description("Servidor Local (IntelliJ IDEA)")
                ));
    }
}
