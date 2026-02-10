package ec.fin.coacandes.socios.controller;


import ec.fin.coacandes.socios.dto.SocioRequestDTO;
import ec.fin.coacandes.socios.dto.SocioResponseDTO;
import ec.fin.coacandes.socios.service.SocioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/socios")
@RequiredArgsConstructor
@Tag(name = "Socios", description = "API para gestión de socios")
public class SocioController {

    private final SocioService socioService;

    @PostMapping
    @Operation(summary = "Crear un nuevo socio")
    public ResponseEntity<SocioResponseDTO> crearSocio(@Valid @RequestBody SocioRequestDTO request) {
        return new ResponseEntity<>(socioService.crearSocio(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar socio existente")
    public ResponseEntity<SocioResponseDTO> actualizarSocio(
            @PathVariable UUID id,
            @Valid @RequestBody SocioRequestDTO request) {
        return ResponseEntity.ok(socioService.actualizarSocio(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener socio por ID")
    public ResponseEntity<SocioResponseDTO> obtenerSocio(@PathVariable UUID id) {
        return ResponseEntity.ok(socioService.obtenerSocioPorId(id));
    }

    @GetMapping
    @Operation(summary = "Obtener todos los socios")
    public ResponseEntity<List<SocioResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(socioService.obtenerTodosLosSocios());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar socio (lógico)")
    public ResponseEntity<Void> eliminarSocio(@PathVariable UUID id) {
        socioService.eliminarSocio(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/identificacion/{identificacion}")
    @Operation(summary = "Buscar socio por identificación")
    public ResponseEntity<SocioResponseDTO> buscarPorIdentificacion(
            @PathVariable String identificacion) {
        return ResponseEntity.ok(socioService.obtenerSocioPorIdentificacion(identificacion));
    }
}
