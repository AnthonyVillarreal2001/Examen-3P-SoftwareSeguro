package ec.fin.coacandes.socios;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class SociosApplicationTest {

    @AfterEach
    void tearDown() {
        SociosApplication.close();
    }

    @Test
    void modelMapperBean_seCrea() {
        SociosApplication application = new SociosApplication();
        ModelMapper mapper = application.modelMapper();
        assertNotNull(mapper);
    }

    @Test
    void main_arrancaYSeCierra() {
        System.setProperty("spring.main.web-application-type", "none");
        System.setProperty("spring.datasource.url", "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1");
        System.setProperty("spring.datasource.driverClassName", "org.h2.Driver");
        System.setProperty("spring.datasource.username", "sa");
        System.setProperty("spring.datasource.password", "");
        System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.H2Dialect");
        System.setProperty("spring.jpa.hibernate.ddl-auto", "create-drop");

        SociosApplication.main(new String[]{});
        SociosApplication.close();
    }
}
