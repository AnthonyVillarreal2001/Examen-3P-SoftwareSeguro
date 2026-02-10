package ec.fin.coacandes.socios.config;

import ec.fin.coacandes.socios.entity.Socio;
import ec.fin.coacandes.socios.repository.SocioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DataLoaderEventListenerTest {

    static class TestDataLoader extends DataLoaderEventListener {
        private final List<Socio> base;
        private boolean generated;
        private int generatedCount;

        TestDataLoader(SocioRepository socioRepository, List<Socio> base) {
            super(socioRepository);
            this.base = base;
        }

        @Override
        protected List<Socio> crearSociosBase() {
            return base;
        }

        @Override
        protected void generarSociosAleatorios(int cantidad) {
            generated = true;
            generatedCount = cantidad;
        }
    }

    @Test
    void cargarDatosIniciales_generaSociosCuandoNoHayDatos() {
        SocioRepository repo = mock(SocioRepository.class);
        when(repo.count()).thenReturn(0L);

        Socio socio = new Socio();
        socio.setId(UUID.randomUUID());
        socio.setIdentificacion("1712345678");

        TestDataLoader loader = new TestDataLoader(repo, List.of(socio));

        assertDoesNotThrow(() -> loader.cargarDatosIniciales(mock(ApplicationReadyEvent.class)));
        verify(repo).saveAll(any());
        assertTrue(loader.generated);
        assertEquals(19, loader.generatedCount);
    }

    @Test
    void cargarDatosIniciales_noGeneraAleatoriosSiListaCompleta() {
        SocioRepository repo = mock(SocioRepository.class);
        when(repo.count()).thenReturn(0L);

        TestDataLoader loader = new TestDataLoader(repo, new DataLoaderEventListener(repo).crearSociosBase());

        assertDoesNotThrow(() -> loader.cargarDatosIniciales(mock(ApplicationReadyEvent.class)));
        assertFalse(loader.generated);
    }

    @Test
    void cargarDatosIniciales_noHaceNadaSiYaExistenSocios() {
        SocioRepository repo = mock(SocioRepository.class);
        when(repo.count()).thenReturn(5L);
        when(repo.findAll()).thenReturn(List.of(new Socio()));

        DataLoaderEventListener loader = new DataLoaderEventListener(repo);

        assertDoesNotThrow(() -> loader.cargarDatosIniciales(mock(ApplicationReadyEvent.class)));
        verify(repo, never()).saveAll(any());
    }

    @Test
    void cargarDatosIniciales_manejaErroresSinExplotar() {
        SocioRepository repo = mock(SocioRepository.class);
        when(repo.count()).thenReturn(0L);
        when(repo.saveAll(any())).thenThrow(new RuntimeException("boom"));

        DataLoaderEventListener loader = new DataLoaderEventListener(repo);

        assertDoesNotThrow(() -> loader.cargarDatosIniciales(mock(ApplicationReadyEvent.class)));
    }

    @Test
    void generarSociosAleatorios_guardaYManejaErrores() {
        SocioRepository repo = mock(SocioRepository.class);
        DataLoaderEventListener loader = new DataLoaderEventListener(repo);

        when(repo.save(any())).thenReturn(new Socio());
        assertDoesNotThrow(() -> loader.generarSociosAleatorios(1));
        verify(repo, atLeastOnce()).save(any());

        when(repo.save(any())).thenThrow(new RuntimeException("boom"));
        assertDoesNotThrow(() -> loader.generarSociosAleatorios(1));
    }

    @Test
    void crearSocioYBase_cubreCampos() {
        SocioRepository repo = mock(SocioRepository.class);
        DataLoaderEventListener loader = new DataLoaderEventListener(repo);

        Socio socio = loader.crearSocio("1712345678", "Juan", "Perez",
                "juan@test.com", "0999999999", "Calle 1", "CEDULA", true);

        assertEquals("1712345678", socio.getIdentificacion());
        assertEquals("Juan", socio.getNombres());
        assertTrue(loader.crearSociosBase().size() >= 1);
    }
}
