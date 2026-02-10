package ec.fin.coacandes.socios.repository;

import ec.fin.coacandes.socios.entity.Socio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SocioRepository extends JpaRepository<Socio, UUID> {

    Optional<Socio> findByIdentificacion(String identificacion);

    boolean existsByIdentificacion(String identificacion);

    Optional<Socio> findByIdAndActivoTrue(UUID id);
}
