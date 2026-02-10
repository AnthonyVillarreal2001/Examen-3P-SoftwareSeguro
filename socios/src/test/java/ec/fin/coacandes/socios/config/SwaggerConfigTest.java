package ec.fin.coacandes.socios.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class SwaggerConfigTest {

    @Test
    void customOpenAPI_tieneInfo() {
        SwaggerConfig config = new SwaggerConfig();
        OpenAPI api = config.customOpenAPI();

        assertNotNull(api.getInfo());
        assertEquals("API de Socios - Cooperativa", api.getInfo().getTitle());
    }
}
