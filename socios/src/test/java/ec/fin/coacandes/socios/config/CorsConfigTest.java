package ec.fin.coacandes.socios.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class CorsConfigTest {

    @Test
    void addCorsMappings_noFalla() {
        CorsConfig config = new CorsConfig();
        CorsRegistry registry = new CorsRegistry();

        assertDoesNotThrow(() -> config.addCorsMappings(registry));
    }
}
