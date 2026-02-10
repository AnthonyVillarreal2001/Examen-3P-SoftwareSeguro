package ec.fin.coacandes.socios.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Schema(description = "DTO para respuesta de socios")
public class SocioResponseDTO {

    @Schema(description = "ID único del socio", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(example = "1712345678")
    private String identificacion;

    @Schema(example = "Juan Carlos")
    private String nombres;

    @Schema(example = "Pérez González")
    private String apellidos;

    @Schema(example = "juan.perez@email.com")
    private String email;

    @Schema(example = "0987654321")
    private String telefono;

    @Schema(example = "Av. Principal 123")
    private String direccion;

    @Schema(example = "CEDULA")
    private String tipoIdentificacion;

    @Schema(example = "true")
    private Boolean activo;

    @Schema(example = "2024-01-15T10:30:00")
    private LocalDateTime fechaCreacion;

    @Schema(example = "2024-01-15T10:30:00")
    private LocalDateTime fechaActualizacion;
}