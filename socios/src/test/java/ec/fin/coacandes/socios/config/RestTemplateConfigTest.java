package ec.fin.coacandes.socios.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class RestTemplateConfigTest {

    @Test
    void restTemplateBean_seCrea() {
        RestTemplateConfig config = new RestTemplateConfig();
        RestTemplate template = config.restTemplate();
        assertNotNull(template);
    }
}
