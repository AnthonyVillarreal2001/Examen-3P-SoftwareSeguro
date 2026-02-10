package ec.fin.coacandes.socios.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuentasValidacionResponse {
    private String socioId;
    private Boolean tieneCuentasActivas;
    private Integer numeroCuentasActivas;
}
