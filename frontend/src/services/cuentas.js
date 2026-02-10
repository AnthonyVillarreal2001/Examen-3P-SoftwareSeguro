import { requestJson } from './http';

const CUENTAS_BASE = import.meta.env.VITE_API_CUENTAS || 'http://localhost:3000/cuentas';
const VALIDACION_BASE =
  import.meta.env.VITE_API_CUENTAS_VALIDACION || 'http://localhost:3000/api/cuentas/validaciones';

export const cuentasApi = {
  createCuenta(payload) {
    return requestJson(CUENTAS_BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateCuenta(id, payload) {
    return requestJson(`${CUENTAS_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  getCuentaById(id) {
    return requestJson(`${CUENTAS_BASE}/${id}`);
  },
  listCuentas() {
    return requestJson(CUENTAS_BASE);
  },
  listCuentasPorSocio(socioId) {
    return requestJson(`${CUENTAS_BASE}/socio/${socioId}`);
  },
  deleteCuenta(id) {
    return requestJson(`${CUENTAS_BASE}/${id}`, {
      method: 'DELETE',
    });
  },
  depositar(id, monto) {
    return requestJson(`${CUENTAS_BASE}/${id}/deposito`, {
      method: 'POST',
      body: JSON.stringify({ monto }),
    });
  },
  retirar(id, monto) {
    return requestJson(`${CUENTAS_BASE}/${id}/retiro`, {
      method: 'POST',
      body: JSON.stringify({ monto }),
    });
  },
  validarCuentasActivas(socioId) {
    return requestJson(`${VALIDACION_BASE}/socio/${socioId}/tiene-cuentas-activas`);
  },
};
