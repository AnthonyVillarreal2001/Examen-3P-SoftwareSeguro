package ec.fin.coacandes.socios.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class CuentasClientService {

    @Value("${cuentas.service.url:http://localhost:3000}")
    private String cuentasServiceUrl;

    private final RestTemplate restTemplate;

    public CuentasClientService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Valida si un socio tiene cuentas activas antes de eliminarlo
     * @param socioId ID del socio a validar
     * @return true si tiene cuentas activas, false si no tiene
     * @throws IllegalStateException si el servicio de cuentas no está disponible
     */
    public boolean socioTieneCuentasActivas(String socioId) {
        try {
            log.info("Validando cuentas activas para socio: {}", socioId);
            
            String url = String.format("%s/api/cuentas/validaciones/socio/%s/tiene-cuentas-activas", 
                                       cuentasServiceUrl, socioId);
            
            CuentasValidacionResponse response = restTemplate.getForObject(url, CuentasValidacionResponse.class);
            
            if (response != null) {
                log.info("Socio {} tiene {} cuentas activas", socioId, response.getNumeroCuentasActivas());
                return response.getTieneCuentasActivas();
            }
            
            return false;
        } catch (HttpClientErrorException.NotFound e) {
            // Si el endpoint retorna 404, asumimos que no tiene cuentas
            log.warn("Endpoint de validación no encontrado para socio: {}", socioId);
            return false;
        } catch (Exception e) {
            log.error("Error al validar cuentas activas para socio {}: {}", socioId, e.getMessage());
            throw new IllegalStateException(
                "No se pudo validar las cuentas del socio. El servicio de cuentas no está disponible", e
            );
        }
    }
}
