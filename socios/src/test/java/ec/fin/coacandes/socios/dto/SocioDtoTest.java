package ec.fin.coacandes.socios.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SocioDtoTest {

    @Test
    void socioRequestDto_gettersSetters() {
        SocioRequestDTO dto = new SocioRequestDTO();
        dto.setIdentificacion("1712345678");
        dto.setNombres("Juan");
        dto.setApellidos("Perez");
        dto.setEmail("juan@test.com");
        dto.setTelefono("0999999999");
        dto.setDireccion("Calle 1");
        dto.setTipoIdentificacion("CEDULA");

        assertEquals("1712345678", dto.getIdentificacion());
        assertEquals("Juan", dto.getNombres());
        assertEquals("Perez", dto.getApellidos());
    }

    @Test
    void socioResponseDto_gettersSetters() {
        SocioResponseDTO dto = new SocioResponseDTO();
        UUID id = UUID.randomUUID();
        dto.setId(id);
        dto.setIdentificacion("1712345678");
        dto.setNombres("Juan");
        dto.setApellidos("Perez");
        dto.setEmail("juan@test.com");
        dto.setTelefono("0999999999");
        dto.setDireccion("Calle 1");
        dto.setTipoIdentificacion("CEDULA");
        dto.setActivo(true);
        dto.setFechaCreacion(LocalDateTime.now());
        dto.setFechaActualizacion(LocalDateTime.now());

        assertEquals(id, dto.getId());
        assertEquals("1712345678", dto.getIdentificacion());
        assertEquals(true, dto.getActivo());
    }
}
