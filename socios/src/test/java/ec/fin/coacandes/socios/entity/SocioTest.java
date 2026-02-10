package ec.fin.coacandes.socios.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SocioTest {

    @Test
    void gettersSetters() {
        Socio socio = new Socio();
        UUID id = UUID.randomUUID();
        socio.setId(id);
        socio.setIdentificacion("1712345678");
        socio.setNombres("Juan");
        socio.setApellidos("Perez");
        socio.setEmail("juan@test.com");
        socio.setTelefono("0999999999");
        socio.setDireccion("Calle 1");
        socio.setActivo(true);
        socio.setTipoIdentificacion("CEDULA");
        socio.setFechaCreacion(LocalDateTime.now());
        socio.setFechaActualizacion(LocalDateTime.now());

        assertEquals(id, socio.getId());
        assertEquals("1712345678", socio.getIdentificacion());
        assertEquals(true, socio.getActivo());
    }
}
