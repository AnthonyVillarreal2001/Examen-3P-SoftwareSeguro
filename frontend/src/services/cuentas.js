import { requestJson, getApiBase } from './http';

const CUENTAS_BASE = getApiBase('cuentas');
const VALIDACION_BASE = getApiBase('cuentas-validacion');

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
