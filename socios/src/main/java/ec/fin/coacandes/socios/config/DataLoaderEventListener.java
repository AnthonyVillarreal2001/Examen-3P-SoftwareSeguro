package ec.fin.coacandes.socios.config;

import ec.fin.coacandes.socios.entity.Socio;
import ec.fin.coacandes.socios.repository.SocioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoaderEventListener {

    private final SocioRepository socioRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Order(1) // Ejecutar después de que el contexto esté completamente inicializado
    @Transactional
    public void cargarDatosIniciales(ApplicationReadyEvent event) {
        try {
            log.info("🔍 Verificando datos iniciales de socios...");

            long count = socioRepository.count();

            if (count == 0) {
                log.info("📥 No hay socios en la BD. Generando 20 socios de prueba...");

                List<Socio> socios = crearSociosBase();

                socioRepository.saveAll(socios);
                log.info("✅ {} socios cargados exitosamente", socios.size());

                // Generar datos adicionales aleatorios si se necesitan más
                if (socios.size() < 20) {
                    generarSociosAleatorios(20 - socios.size());
                }

            } else {
                log.info("✅ Ya existen {} socios registrados en el sistema", count);

                // Verificar datos de muestra
                socioRepository.findAll().stream().limit(5).forEach(socio ->
                        log.debug("📋 Socio existente: {} - {}",
                                socio.getIdentificacion(),
                                socio.getNombres()));
            }

        } catch (Exception e) {
            log.error("❌ Error crítico al cargar datos iniciales: {}", e.getMessage(), e);
        }
    }

    protected List<Socio> crearSociosBase() {
        return List.of(
                // 15 Personas Naturales (Cédula)
                crearSocio("1712345678", "Juan Carlos", "Pérez González",
                        "juan.perez@gmail.com", "0987654321",
                        "Av. Amazonas N23-45", "CEDULA", true),

                crearSocio("1723456789", "María José", "Rodríguez López",
                        "maria.rodriguez@outlook.com", "0998765432",
                        "Calle Roca 456", "CEDULA", true),

                crearSocio("1734567890", "Carlos Andrés", "García Martínez",
                        "carlos.garcia@yahoo.com", "0976543210",
                        "Av. 6 de Diciembre 789", "CEDULA", true),

                crearSocio("1745678901", "Ana Lucía", "Fernández Sánchez",
                        "ana.fernandez@gmail.com", "0965432109",
                        "Calle Guayas 101", "CEDULA", true),

                crearSocio("1756789012", "Luis Alberto", "González Díaz",
                        "luis.gonzalez@hotmail.com", "0954321098",
                        "Av. Shyris 202", "CEDULA", true),

                crearSocio("1767890123", "Laura Isabel", "López Ruiz",
                        "laura.lopez@gmail.com", "0943210987",
                        "Calle Pichincha 303", "CEDULA", true),

                crearSocio("1778901234", "Pedro Pablo", "Martínez Hernández",
                        "pedro.martinez@outlook.com", "0932109876",
                        "Av. Naciones Unidas 404", "CEDULA", true),

                crearSocio("1789012345", "Sofía Alejandra", "Sánchez Moreno",
                        "sofia.sanchez@yahoo.com", "0921098765",
                        "Calle Vargas 505", "CEDULA", true),

                crearSocio("1790123456", "José Manuel", "Pérez Muñoz",
                        "jose.perez@gmail.com", "0910987654",
                        "Av. Patria 606", "CEDULA", true),

                crearSocio("1701234567", "Elena María", "Gómez Álvarez",
                        "elena.gomez@hotmail.com", "0909876543",
                        "Calle Ulloa 707", "CEDULA", true),

                crearSocio("1711122334", "Miguel Ángel", "Martín Romero",
                        "miguel.martin@gmail.com", "0898765432",
                        "Av. Mariana de Jesús 808", "CEDULA", true),

                crearSocio("1722233445", "Isabel Cristina", "Jiménez Alonso",
                        "isabel.jimenez@outlook.com", "0887654321",
                        "Calle Whymper 909", "CEDULA", true),

                crearSocio("1733344556", "David Esteban", "Ruiz Navarro",
                        "david.ruiz@yahoo.com", "0876543210",
                        "Av. 10 de Agosto 1010", "CEDULA", true),

                crearSocio("1744455667", "Carmen Rosa", "Hernández Torres",
                        "carmen.hernandez@gmail.com", "0865432109",
                        "Calle Belo Horizonte 1111", "CEDULA", true),

                crearSocio("1755566778", "Javier Antonio", "Díaz Domínguez",
                        "javier.diaz@hotmail.com", "0854321098",
                        "Av. Eloy Alfaro 1212", "CEDULA", false),

                // 5 Empresas (RUC)
                crearSocio("1791234567001", "Importadora ABC S.A.",
                        "Comercial", "ventas@abc.com.ec", "022345678",
                        "Av. Amazonas N34-102", "RUC", true),

                crearSocio("1792345678001", "Distribuidora XYZ Cía. Ltda.",
                        "Logística", "info@xyzlogistica.com", "022456789",
                        "Calle Robles 234", "RUC", true),

                crearSocio("1793456789001", "Tecnología Innovadora S.A.",
                        "Tecnología", "soporte@tecnoinnov.com", "022567890",
                        "Av. 6 de Diciembre 456", "RUC", true),

                crearSocio("1794567890001", "Constructora Edificadora S.A.",
                        "Construcción", "proyectos@constructora.com", "022678901",
                        "Calle de los Shyris 789", "RUC", true),

                crearSocio("1795678901001", "Agroexportadora del Valle S.A.",
                        "Agroindustria", "exportaciones@agrovalle.com", "022789012",
                        "Km 12 Vía a Samborondón", "RUC", false)
        );
    }

    protected Socio crearSocio(String identificacion, String nombres, String apellidos,
                             String email, String telefono, String direccion,
                             String tipoIdentificacion, boolean activo) {
        Socio socio = new Socio();
        socio.setIdentificacion(identificacion);
        socio.setNombres(nombres);
        socio.setApellidos(apellidos);
        socio.setEmail(email);
        socio.setTelefono(telefono);
        socio.setDireccion(direccion);
        socio.setTipoIdentificacion(tipoIdentificacion);
        socio.setActivo(activo);
        return socio;
    }

        protected void generarSociosAleatorios(int cantidad) {
        Random random = new Random();
        String[] nombresHombres = {"Carlos", "Luis", "Pedro", "Javier", "Miguel", "Andrés"};
        String[] nombresMujeres = {"Ana", "María", "Laura", "Sofía", "Carmen", "Patricia"};
        String[] apellidos1 = {"García", "Rodríguez", "López", "Martínez", "Sánchez", "Pérez"};
        String[] apellidos2 = {"González", "Fernández", "Díaz", "Torres", "Ramírez", "Castro"};

        for (int i = 0; i < cantidad; i++) {
            try {
                Socio socio = new Socio();

                // Generar cédula única
                String cedula = "17" + String.format("%08d",
                        (System.currentTimeMillis() % 100000000) + i);

                socio.setIdentificacion(cedula);
                socio.setTipoIdentificacion("CEDULA");

                // Nombre aleatorio
                boolean esHombre = random.nextBoolean();
                String nombre = esHombre ?
                        nombresHombres[random.nextInt(nombresHombres.length)] :
                        nombresMujeres[random.nextInt(nombresMujeres.length)];

                socio.setNombres(nombre + " " +
                        (esHombre ? "Antonio" : "Isabel"));
                socio.setApellidos(apellidos1[random.nextInt(apellidos1.length)] + " " +
                        apellidos2[random.nextInt(apellidos2.length)]);

                // Email
                socio.setEmail((socio.getNombres().split(" ")[0].toLowerCase() + "." +
                        socio.getApellidos().split(" ")[0].toLowerCase() + i +
                        "@cooperativa.com.ec").replace(" ", ""));

                // Teléfono
                socio.setTelefono("09" + String.format("%08d", random.nextInt(100000000)));

                // Dirección
                socio.setDireccion("Calle " + (random.nextInt(100) + 1) +
                        " #" + (random.nextInt(100) + 1) +
                        " y Av. " + (char)('A' + random.nextInt(26)));

                socio.setActivo(random.nextDouble() > 0.1); // 90% activos

                socioRepository.save(socio);
                log.debug("➕ Socio aleatorio creado: {}", socio.getIdentificacion());

            } catch (Exception e) {
                log.warn("⚠️ No se pudo crear socio aleatorio: {}", e.getMessage());
            }
        }
    }
}
