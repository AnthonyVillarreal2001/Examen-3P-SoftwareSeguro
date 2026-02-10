package ec.fin.coacandes.socios.client;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CuentasValidacionResponseTest {

    @Test
    void gettersSetters() {
        CuentasValidacionResponse response = new CuentasValidacionResponse();
        response.setSocioId("socio-1");
        response.setTieneCuentasActivas(true);
        response.setNumeroCuentasActivas(2);

        assertEquals("socio-1", response.getSocioId());
        assertEquals(true, response.getTieneCuentasActivas());
        assertEquals(2, response.getNumeroCuentasActivas());
    }

    @Test
    void constructorAllArgs() {
        CuentasValidacionResponse response = new CuentasValidacionResponse("socio-2", false, 0);
        assertEquals("socio-2", response.getSocioId());
        assertEquals(false, response.getTieneCuentasActivas());
        assertEquals(0, response.getNumeroCuentasActivas());
    }
}
