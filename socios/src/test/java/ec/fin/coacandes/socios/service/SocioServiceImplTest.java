package ec.fin.coacandes.socios.service;

import ec.fin.coacandes.socios.client.CuentasClientService;
import ec.fin.coacandes.socios.dto.SocioRequestDTO;
import ec.fin.coacandes.socios.dto.SocioResponseDTO;
import ec.fin.coacandes.socios.entity.Socio;
import ec.fin.coacandes.socios.repository.SocioRepository;
import ec.fin.coacandes.socios.service.impl.SocioServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SocioServiceImplTest {

    @Mock
    private SocioRepository socioRepository;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private CuentasClientService cuentasClientService;

    @InjectMocks
    private SocioServiceImpl service;

    private SocioRequestDTO buildRequest(String identificacion) {
        SocioRequestDTO request = new SocioRequestDTO();
        request.setIdentificacion(identificacion);
        request.setNombres("Juan");
        request.setApellidos("Perez");
        request.setEmail("juan@test.com");
        request.setTelefono("0999999999");
        request.setDireccion("Calle 1");
        request.setTipoIdentificacion("CEDULA");
        return request;
    }

    private Socio buildSocio(UUID id, String identificacion) {
        Socio socio = new Socio();
        socio.setId(id);
        socio.setIdentificacion(identificacion);
        socio.setNombres("Juan");
        socio.setApellidos("Perez");
        socio.setEmail("juan@test.com");
        socio.setTelefono("0999999999");
        socio.setDireccion("Calle 1");
        socio.setTipoIdentificacion("CEDULA");
        socio.setActivo(true);
        return socio;
    }

    @Test
    void crearSocio_lanzaErrorSiIdentificacionExiste() {
        SocioRequestDTO request = buildRequest("1712345678");
        when(socioRepository.existsByIdentificacion(request.getIdentificacion())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.crearSocio(request));
        verify(socioRepository, never()).save(any());
    }

    @Test
    void crearSocio_guardaYRetornaDTO() {
        SocioRequestDTO request = buildRequest("1712345678");
        Socio socio = buildSocio(UUID.randomUUID(), request.getIdentificacion());
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(socio.getId());
        response.setIdentificacion(socio.getIdentificacion());

        when(socioRepository.existsByIdentificacion(request.getIdentificacion())).thenReturn(false);
        when(modelMapper.map(request, Socio.class)).thenReturn(socio);
        when(socioRepository.save(socio)).thenReturn(socio);
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(response);

        SocioResponseDTO result = service.crearSocio(request);

        assertEquals(socio.getId(), result.getId());
        verify(socioRepository).save(socio);
    }

    @Test
    void actualizarSocio_lanzaErrorSiNoExiste() {
        UUID id = UUID.randomUUID();
        when(socioRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.actualizarSocio(id, buildRequest("1712345678")));
    }

    @Test
    void actualizarSocio_lanzaErrorSiIdentificacionDuplicada() {
        UUID id = UUID.randomUUID();
        Socio existente = buildSocio(id, "1712345678");
        SocioRequestDTO request = buildRequest("1799999999");

        when(socioRepository.findById(id)).thenReturn(Optional.of(existente));
        when(socioRepository.existsByIdentificacion(request.getIdentificacion())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.actualizarSocio(id, request));
    }

    @Test
    void actualizarSocio_actualizaYRetornaDTO() {
        UUID id = UUID.randomUUID();
        Socio existente = buildSocio(id, "1712345678");
        SocioRequestDTO request = buildRequest("1712345678");
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(id);
        response.setIdentificacion(request.getIdentificacion());

        when(socioRepository.findById(id)).thenReturn(Optional.of(existente));
        when(socioRepository.save(existente)).thenReturn(existente);
        doAnswer(invocation -> null).when(modelMapper).map(eq(request), eq(existente));
        when(modelMapper.map(existente, SocioResponseDTO.class)).thenReturn(response);

        SocioResponseDTO result = service.actualizarSocio(id, request);

        ArgumentCaptor<Socio> captor = ArgumentCaptor.forClass(Socio.class);
        verify(modelMapper).map(eq(request), captor.capture());
        assertEquals(existente, captor.getValue());
        assertEquals(id, result.getId());
    }

    @Test
    void actualizarSocio_permiteCambioIdentificacionSiNoExiste() {
        UUID id = UUID.randomUUID();
        Socio existente = buildSocio(id, "1712345678");
        SocioRequestDTO request = buildRequest("1799999999");
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(id);

        when(socioRepository.findById(id)).thenReturn(Optional.of(existente));
        when(socioRepository.existsByIdentificacion(request.getIdentificacion())).thenReturn(false);
        when(socioRepository.save(existente)).thenReturn(existente);
        doAnswer(invocation -> null).when(modelMapper).map(eq(request), eq(existente));
        when(modelMapper.map(existente, SocioResponseDTO.class)).thenReturn(response);

        SocioResponseDTO result = service.actualizarSocio(id, request);

        assertEquals(id, result.getId());
        verify(modelMapper).map(eq(request), eq(existente));
    }

    @Test
    void obtenerSocioPorId_lanzaErrorSiNoExiste() {
        UUID id = UUID.randomUUID();
        when(socioRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.obtenerSocioPorId(id));
    }

    @Test
    void obtenerSocioPorId_retornaDTO() {
        UUID id = UUID.randomUUID();
        Socio socio = buildSocio(id, "1712345678");
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(id);

        when(socioRepository.findById(id)).thenReturn(Optional.of(socio));
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(response);

        SocioResponseDTO result = service.obtenerSocioPorId(id);

        assertEquals(id, result.getId());
    }

    @Test
    void obtenerTodosLosSocios_retornaLista() {
        Socio socio = buildSocio(UUID.randomUUID(), "1712345678");
        when(socioRepository.findAll()).thenReturn(List.of(socio));
        when(modelMapper.map(eq(socio), eq(SocioResponseDTO.class))).thenAnswer(invocation -> {
            SocioResponseDTO dto = new SocioResponseDTO();
            dto.setId(socio.getId());
            return dto;
        });

        List<SocioResponseDTO> result = service.obtenerTodosLosSocios();

        assertEquals(1, result.size());
        assertEquals(socio.getId(), result.get(0).getId());
    }

    @Test
    void eliminarSocio_lanzaErrorSiTieneCuentasActivas() {
        UUID id = UUID.randomUUID();
        Socio socio = buildSocio(id, "1712345678");
        when(socioRepository.findById(id)).thenReturn(Optional.of(socio));
        when(cuentasClientService.socioTieneCuentasActivas(id.toString())).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> service.eliminarSocio(id));
        verify(socioRepository, never()).deleteById(id);
    }

    @Test
    void eliminarSocio_eliminaSiNoTieneCuentas() {
        UUID id = UUID.randomUUID();
        Socio socio = buildSocio(id, "1712345678");
        when(socioRepository.findById(id)).thenReturn(Optional.of(socio));
        when(cuentasClientService.socioTieneCuentasActivas(id.toString())).thenReturn(false);

        assertDoesNotThrow(() -> service.eliminarSocio(id));
        verify(socioRepository).deleteById(id);
    }

    @Test
    void obtenerSocioPorIdentificacion_lanzaErrorSiNoExiste() {
        when(socioRepository.findByIdentificacion("1712345678")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.obtenerSocioPorIdentificacion("1712345678"));
    }

    @Test
    void obtenerSocioPorIdentificacion_retornaDTO() {
        Socio socio = buildSocio(UUID.randomUUID(), "1712345678");
        SocioResponseDTO response = new SocioResponseDTO();
        response.setId(socio.getId());

        when(socioRepository.findByIdentificacion(socio.getIdentificacion())).thenReturn(Optional.of(socio));
        when(modelMapper.map(socio, SocioResponseDTO.class)).thenReturn(response);

        SocioResponseDTO result = service.obtenerSocioPorIdentificacion(socio.getIdentificacion());

        assertEquals(socio.getId(), result.getId());
    }
}
