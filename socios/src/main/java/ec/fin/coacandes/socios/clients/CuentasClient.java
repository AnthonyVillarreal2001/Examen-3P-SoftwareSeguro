package ec.fin.coacandes.socios.clients;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CuentasClient {

    private final RestTemplate restTemplate;

    @Value("${cuentas.service.url:http://localhost:3000}")
    private String cuentasServiceUrl;

    public boolean tieneCuentasActivas(UUID socioId) {
        try {
            log.info("Consultando cuentas activas para socio: {}", socioId);

            String url = cuentasServiceUrl + "/cuentas/socio/" + socioId;

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Object[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Object[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object[] cuentas = response.getBody();
                log.info("Socio {} tiene {} cuentas activas", socioId, cuentas.length);
                return cuentas.length > 0;
            }

            return false;
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("No se encontraron cuentas para socio: {}", socioId);
            return false;
        } catch (ResourceAccessException e) {
            log.error("Error de conexión con servicio de cuentas: {}", e.getMessage());
            throw new RuntimeException("Servicio de cuentas no disponible", e);
        } catch (Exception e) {
            log.error("Error inesperado al consultar cuentas: {}", e.getMessage());
            throw new RuntimeException("Error al validar cuentas del socio", e);
        }
    }

    public List<?> obtenerCuentasPorSocio(UUID socioId) {
        try {
            String url = cuentasServiceUrl + "/cuentas/socio/" + socioId;

            ResponseEntity<Object[]> response = restTemplate.getForEntity(url, Object[].class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return List.of(response.getBody());
            }

            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Error al obtener cuentas: {}", e.getMessage());
            throw new RuntimeException("Error al obtener cuentas del socio", e);
        }
    }
}