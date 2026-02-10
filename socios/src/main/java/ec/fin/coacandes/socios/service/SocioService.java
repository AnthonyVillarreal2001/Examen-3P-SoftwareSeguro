package ec.fin.coacandes.socios.service;

import ec.fin.coacandes.socios.dto.SocioRequestDTO;
import ec.fin.coacandes.socios.dto.SocioResponseDTO;

import java.util.List;
import java.util.UUID;

public interface SocioService {
    SocioResponseDTO crearSocio(SocioRequestDTO request);

    SocioResponseDTO actualizarSocio(UUID id, SocioRequestDTO request);

    SocioResponseDTO obtenerSocioPorId(UUID id);

    List<SocioResponseDTO> obtenerTodosLosSocios();

    void eliminarSocio(UUID id);

    SocioResponseDTO obtenerSocioPorIdentificacion(String identificacion);
}
