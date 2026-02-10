import { requestJson, getApiBase } from './http';

const SOCIOS_BASE = getApiBase('socios');

export const sociosApi = {
  createSocio(payload) {
    return requestJson(SOCIOS_BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateSocio(id, payload) {
    return requestJson(`${SOCIOS_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  getSocioById(id) {
    return requestJson(`${SOCIOS_BASE}/${id}`);
  },
  getSocioByIdentificacion(identificacion) {
    return requestJson(`${SOCIOS_BASE}/identificacion/${identificacion}`);
  },
  listSocios() {
    return requestJson(SOCIOS_BASE);
  },
  deleteSocio(id) {
    return requestJson(`${SOCIOS_BASE}/${id}`, {
      method: 'DELETE',
    });
  },
};
