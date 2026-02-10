package ec.fin.coacandes.socios.client;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class CuentasClientServiceTest {

    @Test
    void socioTieneCuentasActivas_retornaTrueCuandoRespuestaLoIndica() {
        CuentasClientService service = new CuentasClientService();
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasValidacionResponse response = new CuentasValidacionResponse("socio-1", true, 2);

        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.getForObject(anyString(), eq(CuentasValidacionResponse.class))).thenReturn(response);

        assertTrue(service.socioTieneCuentasActivas("socio-1"));
    }

    @Test
    void socioTieneCuentasActivas_retornaFalseCuandoRespuestaEsNull() {
        CuentasClientService service = new CuentasClientService();
        RestTemplate restTemplate = mock(RestTemplate.class);

        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.getForObject(anyString(), eq(CuentasValidacionResponse.class))).thenReturn(null);

        assertFalse(service.socioTieneCuentasActivas("socio-1"));
    }

    @Test
    void socioTieneCuentasActivas_retornaFalseSiEndpointNoExiste() {
        CuentasClientService service = new CuentasClientService();
        RestTemplate restTemplate = mock(RestTemplate.class);

        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.getForObject(anyString(), eq(CuentasValidacionResponse.class)))
            .thenThrow(HttpClientErrorException.create(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "Not Found",
                org.springframework.http.HttpHeaders.EMPTY,
                null,
                null));

        assertFalse(service.socioTieneCuentasActivas("socio-1"));
    }

    @Test
    void socioTieneCuentasActivas_lanzaErrorCuandoServicioNoDisponible() {
        CuentasClientService service = new CuentasClientService();
        RestTemplate restTemplate = mock(RestTemplate.class);

        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.getForObject(anyString(), eq(CuentasValidacionResponse.class)))
            .thenThrow(new RuntimeException("down"));

        assertThrows(IllegalStateException.class, () -> service.socioTieneCuentasActivas("socio-1"));
    }
}
