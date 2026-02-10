package ec.fin.coacandes.socios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(description = "DTO para creación y actualización de socios")
public class SocioRequestDTO {

    @NotBlank(message = "La identificación es obligatoria")
    @Pattern(regexp = "^[0-9]{10,13}$", message = "Identificación inválida")
    @Schema(description = "Cédula (10 dígitos) o RUC (13 dígitos)", example = "1712345678")
    private String identificacion;

    @NotBlank(message = "Los nombres son obligatorios")
    @Schema(example = "Juan Carlos")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Schema(example = "Pérez González")
    private String apellidos;

    @Email(message = "Email inválido")
    @Schema(example = "juan.perez@email.com")
    private String email;

    @Pattern(regexp = "^[0-9]{9,10}$", message = "Teléfono inválido")
    @Schema(example = "0987654321")
    private String telefono;

    @Schema(example = "Av. Principal 123")
    private String direccion;

    @NotNull(message = "El tipo de identificación es obligatorio")
    @Schema(example = "CEDULA", allowableValues = {"CEDULA", "RUC"})
    private String tipoIdentificacion;
}
