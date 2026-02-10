package ec.fin.coacandes.socios.controller;

import ec.fin.coacandes.socios.dto.SocioRequestDTO;
import ec.fin.coacandes.socios.dto.SocioResponseDTO;
import ec.fin.coacandes.socios.service.SocioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocioControllerTest {

    @Mock
    private SocioService socioService;

    @InjectMocks
    private SocioController controller;

    @Test
    void crearSocio_retornaCreated() {
        SocioRequestDTO request = new SocioRequestDTO();
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(UUID.randomUUID());

        when(socioService.crearSocio(any())).thenReturn(response);

        ResponseEntity<SocioResponseDTO> result = controller.crearSocio(request);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(response, result.getBody());
    }

    @Test
    void actualizarSocio_retornaOk() {
        UUID id = UUID.randomUUID();
        SocioRequestDTO request = new SocioRequestDTO();
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(id);

        when(socioService.actualizarSocio(id, request)).thenReturn(response);

        ResponseEntity<SocioResponseDTO> result = controller.actualizarSocio(id, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(response, result.getBody());
    }

    @Test
    void obtenerSocio_retornaOk() {
        UUID id = UUID.randomUUID();
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(id);

        when(socioService.obtenerSocioPorId(id)).thenReturn(response);

        ResponseEntity<SocioResponseDTO> result = controller.obtenerSocio(id);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(response, result.getBody());
    }

    @Test
    void obtenerTodos_retornaLista() {
        when(socioService.obtenerTodosLosSocios()).thenReturn(List.of());

        ResponseEntity<List<SocioResponseDTO>> result = controller.obtenerTodos();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNotNull(result.getBody());
    }

    @Test
    void eliminarSocio_retornaNoContent() {
        UUID id = UUID.randomUUID();

        ResponseEntity<Void> result = controller.eliminarSocio(id);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
    }

    @Test
    void buscarPorIdentificacion_retornaOk() {
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(UUID.randomUUID());

        when(socioService.obtenerSocioPorIdentificacion("1712345678")).thenReturn(response);

        ResponseEntity<SocioResponseDTO> result = controller.buscarPorIdentificacion("1712345678");

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(response, result.getBody());
    }
}
