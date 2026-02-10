package ec.fin.coacandes.socios.clients;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CuentasClientTest {

    @Test
    void tieneCuentasActivas_retornaTrueCuandoHayCuentas() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        Object[] body = new Object[] { new Object() };
        org.springframework.http.ResponseEntity<Object[]> response =
            new org.springframework.http.ResponseEntity<>(body, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), any(), any(), eq(Object[].class))).thenReturn(response);

        assertTrue(client.tieneCuentasActivas(UUID.randomUUID()));
    }

    @Test
    void tieneCuentasActivas_retornaFalseCuandoNoHayCuentas() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        org.springframework.http.ResponseEntity<Object[]> response =
            new org.springframework.http.ResponseEntity<>((HttpHeaders) null, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), any(), any(), eq(Object[].class))).thenReturn(response);

        assertFalse(client.tieneCuentasActivas(UUID.randomUUID()));
    }

    @Test
    void tieneCuentasActivas_retornaFalseSiRespuestaNoOk() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        Object[] body = new Object[] { new Object() };
        org.springframework.http.ResponseEntity<Object[]> response =
            new org.springframework.http.ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
        when(restTemplate.exchange(anyString(), any(), any(), eq(Object[].class))).thenReturn(response);

        assertFalse(client.tieneCuentasActivas(UUID.randomUUID()));
    }

    @Test
    void tieneCuentasActivas_retornaFalseSiNoFound() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.exchange(anyString(), any(), any(), eq(Object[].class)))
            .thenThrow(HttpClientErrorException.create(
                HttpStatus.NOT_FOUND,
                "Not Found",
                org.springframework.http.HttpHeaders.EMPTY,
                null,
                null));

        assertFalse(client.tieneCuentasActivas(UUID.randomUUID()));
    }

    @Test
    void tieneCuentasActivas_lanzaErrorSiServicioNoDisponible() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.exchange(anyString(), any(), any(), eq(Object[].class)))
                .thenThrow(new ResourceAccessException("down"));

        assertThrows(RuntimeException.class, () -> client.tieneCuentasActivas(UUID.randomUUID()));
    }

    @Test
    void tieneCuentasActivas_lanzaErrorInesperado() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.exchange(anyString(), any(), any(), eq(Object[].class)))
                .thenThrow(new RuntimeException("boom"));

        assertThrows(RuntimeException.class, () -> client.tieneCuentasActivas(UUID.randomUUID()));
    }

    @Test
    void obtenerCuentasPorSocio_retornaLista() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        Object[] body = new Object[] { new Object(), new Object() };
        org.springframework.http.ResponseEntity<Object[]> response =
            new org.springframework.http.ResponseEntity<>(body, HttpStatus.OK);

        when(restTemplate.getForEntity(anyString(), eq(Object[].class))).thenReturn(response);

        List<?> result = client.obtenerCuentasPorSocio(UUID.randomUUID());

        assertEquals(2, result.size());
    }

    @Test
    void obtenerCuentasPorSocio_retornaVacioSiNoOk() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        org.springframework.http.ResponseEntity<Object[]> response =
            new org.springframework.http.ResponseEntity<>((HttpHeaders) null, HttpStatus.BAD_REQUEST);

        when(restTemplate.getForEntity(anyString(), eq(Object[].class))).thenReturn(response);

        List<?> result = client.obtenerCuentasPorSocio(UUID.randomUUID());

        assertEquals(0, result.size());
    }

    @Test
    void obtenerCuentasPorSocio_lanzaErrorSiFalla() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        CuentasClient client = new CuentasClient(restTemplate);
        ReflectionTestUtils.setField(client, "cuentasServiceUrl", "http://localhost:3000");

        when(restTemplate.getForEntity(anyString(), eq(Object[].class)))
                .thenThrow(new RuntimeException("boom"));

        assertThrows(RuntimeException.class, () -> client.obtenerCuentasPorSocio(UUID.randomUUID()));
    }
}
