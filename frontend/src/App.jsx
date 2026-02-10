import { useMemo, useState } from 'react';
import './App.css';
import { sociosApi } from './services/socios';
import { cuentasApi } from './services/cuentas';

const initialSocio = {
  id: '',
  identificacion: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  direccion: '',
  tipoIdentificacion: '',
};

const initialCuenta = {
  id: '',
  socioId: '',
  numeroCuenta: '',
  saldo: '',
  tipoCuenta: '',
};

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );

function App() {
  const [activeTab, setActiveTab] = useState('socios');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const [socioForm, setSocioForm] = useState(initialSocio);
  const [socioResult, setSocioResult] = useState(null);
  const [sociosList, setSociosList] = useState([]);
  const [buscarIdentificacion, setBuscarIdentificacion] = useState('');

  const [cuentaForm, setCuentaForm] = useState(initialCuenta);
  const [cuentaResult, setCuentaResult] = useState(null);
  const [cuentasList, setCuentasList] = useState([]);
  const [buscarCuentaId, setBuscarCuentaId] = useState('');
  const [buscarSocioId, setBuscarSocioId] = useState('');
  const [operacionCuentaId, setOperacionCuentaId] = useState('');
  const [operacionMonto, setOperacionMonto] = useState('');

  const [consultaSocioId, setConsultaSocioId] = useState('');
  const [validacionResult, setValidacionResult] = useState(null);

  const apiInfo = useMemo(
    () => ({
      socios: import.meta.env.VITE_API_SOCIOS || 'http://localhost:8080/api/socios',
      cuentas: import.meta.env.VITE_API_CUENTAS || 'http://localhost:3000/cuentas',
      validacion:
        import.meta.env.VITE_API_CUENTAS_VALIDACION ||
        'http://localhost:3000/api/cuentas/validaciones',
    }),
    []
  );

  const showStatus = (message, type = 'success') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 4500);
  };

  const handleError = (error) => {
    const message = error?.message || 'Unexpected error';
    showStatus(message, 'error');
  };

  const handleSocioChange = (event) => {
    const { name, value } = event.target;
    setSocioForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCuentaChange = (event) => {
    const { name, value } = event.target;
    setCuentaForm((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarSocio = () => {
    setSocioForm(initialSocio);
    setSocioResult(null);
  };

  const limpiarCuenta = () => {
    setCuentaForm(initialCuenta);
    setCuentaResult(null);
  };

  const guardarSocio = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        identificacion: socioForm.identificacion,
        nombres: socioForm.nombres,
        apellidos: socioForm.apellidos,
        email: socioForm.email,
        telefono: socioForm.telefono,
        direccion: socioForm.direccion,
        tipoIdentificacion: socioForm.tipoIdentificacion,
      };

      let result;
      if (socioForm.id) {
        if (!isUuid(socioForm.id)) {
          showStatus('El ID del socio debe ser UUID valido', 'error');
          return;
        }
        result = await sociosApi.updateSocio(socioForm.id, payload);
        showStatus('Socio actualizado');
      } else {
        result = await sociosApi.createSocio(payload);
        showStatus('Socio creado');
      }

      setSocioForm((prev) => ({ ...prev, id: result.id }));
      setSocioResult(result);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const buscarSocio = async () => {
    if (!buscarIdentificacion) {
      showStatus('Ingresa una identificacion', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await sociosApi.getSocioByIdentificacion(buscarIdentificacion);
      setSocioResult(result);
      setSocioForm((prev) => ({ ...prev, id: result.id || '' }));
      showStatus('Socio encontrado');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const listarSocios = async () => {
    setLoading(true);
    try {
      const result = await sociosApi.listSocios();
      setSociosList(result || []);
      showStatus(`Socios encontrados: ${result.length}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarSocio = async () => {
    if (!socioForm.id) {
      showStatus('Ingresa un socio ID', 'error');
      return;
    }
    setLoading(true);
    try {
      const validacion = await cuentasApi.validarCuentasActivas(socioForm.id);
      if (validacion?.tieneCuentasActivas) {
        showStatus(
          `No se puede eliminar, tiene ${validacion.numeroCuentasActivas} cuentas activas`,
          'error'
        );
        return;
      }
      await sociosApi.deleteSocio(socioForm.id);
      limpiarSocio();
      showStatus('Socio eliminado');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const guardarCuenta = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        socioId: cuentaForm.socioId,
        numeroCuenta: cuentaForm.numeroCuenta,
        saldo: Number(cuentaForm.saldo || 0),
        tipoCuenta: cuentaForm.tipoCuenta,
      };

      let result;
      if (cuentaForm.id) {
        result = await cuentasApi.updateCuenta(cuentaForm.id, payload);
        showStatus('Cuenta actualizada');
      } else {
        result = await cuentasApi.createCuenta(payload);
        showStatus('Cuenta creada');
      }

      setCuentaForm((prev) => ({ ...prev, id: result.id }));
      setCuentaResult(result);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const buscarCuenta = async () => {
    if (!buscarCuentaId) {
      showStatus('Ingresa una cuenta ID', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await cuentasApi.getCuentaById(buscarCuentaId);
      setCuentaResult(result);
      showStatus('Cuenta encontrada');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const listarCuentas = async () => {
    setLoading(true);
    try {
      const result = await cuentasApi.listCuentas();
      setCuentasList(result || []);
      showStatus(`Cuentas encontradas: ${result.length}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const listarCuentasPorSocio = async () => {
    if (!buscarSocioId) {
      showStatus('Ingresa un socio ID', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await cuentasApi.listCuentasPorSocio(buscarSocioId);
      setCuentasList(result || []);
      showStatus(`Cuentas para socio: ${result.length}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarCuenta = async () => {
    if (!cuentaForm.id) {
      showStatus('Ingresa una cuenta ID', 'error');
      return;
    }
    setLoading(true);
    try {
      await cuentasApi.deleteCuenta(cuentaForm.id);
      limpiarCuenta();
      showStatus('Cuenta eliminada');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarOperacion = async (tipo) => {
    if (!operacionCuentaId || !operacionMonto) {
      showStatus('Ingresa cuenta ID y monto', 'error');
      return;
    }
    setLoading(true);
    try {
      const monto = Number(operacionMonto || 0);
      const result =
        tipo === 'deposito'
          ? await cuentasApi.depositar(operacionCuentaId, monto)
          : await cuentasApi.retirar(operacionCuentaId, monto);

      setCuentaResult(result);
      showStatus(`Operacion ${tipo} OK`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const validarSocioCuentas = async () => {
    if (!consultaSocioId) {
      showStatus('Ingresa un socio ID', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await cuentasApi.validarCuentasActivas(consultaSocioId);
      setValidacionResult(result);
      showStatus('Validacion completada');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" data-cy="app">
      <div className="glow glow-primary" />
      <div className="glow glow-secondary" />
      <header className="app-header">
        <div>
          <p className="eyebrow">Microservicios Coordinados</p>
          <h1>Cooperativa Futuro Seguro</h1>
          <p className="subtitle">
            Frontend operativo para socios, cuentas y validaciones cruzadas.
          </p>
        </div>
        <div className="api-card">
          <h3>Endpoints activos</h3>
          <div>
            <span>Socios</span>
            <strong>{apiInfo.socios}</strong>
          </div>
          <div>
            <span>Cuentas</span>
            <strong>{apiInfo.cuentas}</strong>
          </div>
          <div>
            <span>Validacion</span>
            <strong>{apiInfo.validacion}</strong>
          </div>
        </div>
      </header>

      <nav className="tabs">
        {['socios', 'cuentas', 'consultas'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            data-cy={`tab-${tab}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
        <div className="tab-indicator" data-tab={activeTab} />
      </nav>

      {status && (
        <div className={`status ${status.type}`} data-cy="status">
          {status.message}
        </div>
      )}

      <section className="grid">
        {activeTab === 'socios' && (
          <>
            <div className="panel">
              <h2>Gestion de socios</h2>
              <form className="form" onSubmit={guardarSocio}>
                <div className="field">
                  <label>Socio ID (para actualizar)</label>
                  <input
                    name="id"
                    value={socioForm.id}
                    onChange={handleSocioChange}
                    placeholder="UUID del socio"
                    data-cy="socio-id"
                  />
                </div>
                <div className="field">
                  <label>Identificacion</label>
                  <input
                    name="identificacion"
                    value={socioForm.identificacion}
                    onChange={handleSocioChange}
                    required
                    pattern="[0-9]{10,13}"
                    data-cy="socio-identificacion"
                  />
                </div>
                <div className="row">
                  <div className="field">
                    <label>Nombres</label>
                    <input
                      name="nombres"
                      value={socioForm.nombres}
                      onChange={handleSocioChange}
                      required
                      data-cy="socio-nombres"
                    />
                  </div>
                  <div className="field">
                    <label>Apellidos</label>
                    <input
                      name="apellidos"
                      value={socioForm.apellidos}
                      onChange={handleSocioChange}
                      required
                      data-cy="socio-apellidos"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="field">
                    <label>Email</label>
                    <input
                      name="email"
                      type="email"
                      value={socioForm.email}
                      onChange={handleSocioChange}
                      data-cy="socio-email"
                    />
                  </div>
                  <div className="field">
                    <label>Telefono</label>
                    <input
                      name="telefono"
                      value={socioForm.telefono}
                      onChange={handleSocioChange}
                      pattern="[0-9]{9,10}"
                      data-cy="socio-telefono"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Direccion</label>
                  <input
                    name="direccion"
                    value={socioForm.direccion}
                    onChange={handleSocioChange}
                    data-cy="socio-direccion"
                  />
                </div>
                <div className="field">
                  <label>Tipo de identificacion</label>
                  <select
                    name="tipoIdentificacion"
                    value={socioForm.tipoIdentificacion}
                    onChange={handleSocioChange}
                    required
                    data-cy="socio-tipo-identificacion"
                  >
                    <option value="">Selecciona</option>
                    <option value="CEDULA">CEDULA</option>
                    <option value="RUC">RUC</option>
                  </select>
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    type="submit"
                    disabled={loading}
                    data-cy="socio-submit"
                  >
                    {loading ? 'Procesando...' : 'Guardar socio'}
                  </button>
                  <button type="button" onClick={limpiarSocio} data-cy="socio-clear">
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            <div className="panel">
              <h2>Consultas de socios</h2>
              <div className="field">
                <label>Buscar por identificacion</label>
                <div className="inline">
                  <input
                    value={buscarIdentificacion}
                    onChange={(event) => setBuscarIdentificacion(event.target.value)}
                    placeholder="Identificacion"
                    data-cy="socio-buscar-identificacion"
                  />
                  <button
                    type="button"
                    onClick={buscarSocio}
                    disabled={loading}
                    data-cy="socio-buscar"
                  >
                    Buscar
                  </button>
                </div>
              </div>
              <div className="actions">
                <button
                  type="button"
                  onClick={listarSocios}
                  disabled={loading}
                  data-cy="socio-listar"
                >
                  Listar socios
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={eliminarSocio}
                  disabled={loading}
                  data-cy="socio-eliminar"
                >
                  Eliminar socio
                </button>
              </div>

              <div className="results">
                <h3>Resultado</h3>
                {socioResult ? (
                  <pre data-cy="socio-result">
                    {JSON.stringify(socioResult, null, 2)}
                  </pre>
                ) : (
                  <p className="muted">Sin resultado cargado</p>
                )}
              </div>

              <div className="results">
                <h3>Lista</h3>
                {sociosList.length ? (
                  <ul data-cy="socios-list">
                    {sociosList.map((socio) => (
                      <li key={socio.id}>
                        <strong>{socio.nombres} {socio.apellidos}</strong>
                        <span>{socio.identificacion}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Sin socios listados</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'cuentas' && (
          <>
            <div className="panel">
              <h2>Gestion de cuentas</h2>
              <form className="form" onSubmit={guardarCuenta}>
                <div className="field">
                  <label>Cuenta ID (para actualizar)</label>
                  <input
                    name="id"
                    value={cuentaForm.id}
                    onChange={handleCuentaChange}
                    placeholder="UUID cuenta"
                    data-cy="cuenta-id"
                  />
                </div>
                <div className="field">
                  <label>Socio ID</label>
                  <input
                    name="socioId"
                    value={cuentaForm.socioId}
                    onChange={handleCuentaChange}
                    required
                    data-cy="cuenta-socio-id"
                  />
                </div>
                <div className="field">
                  <label>Numero de cuenta</label>
                  <input
                    name="numeroCuenta"
                    value={cuentaForm.numeroCuenta}
                    onChange={handleCuentaChange}
                    required
                    data-cy="cuenta-numero"
                  />
                </div>
                <div className="row">
                  <div className="field">
                    <label>Saldo inicial</label>
                    <input
                      name="saldo"
                      type="number"
                      min="0"
                      step="0.01"
                      value={cuentaForm.saldo}
                      onChange={handleCuentaChange}
                      required
                      data-cy="cuenta-saldo"
                    />
                  </div>
                  <div className="field">
                    <label>Tipo de cuenta</label>
                    <select
                      name="tipoCuenta"
                      value={cuentaForm.tipoCuenta}
                      onChange={handleCuentaChange}
                      required
                      data-cy="cuenta-tipo"
                    >
                      <option value="">Selecciona</option>
                      <option value="AHORRO">AHORRO</option>
                      <option value="CORRIENTE">CORRIENTE</option>
                      <option value="PLAZO_FIJO">PLAZO_FIJO</option>
                    </select>
                  </div>
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    type="submit"
                    disabled={loading}
                    data-cy="cuenta-submit"
                  >
                    {loading ? 'Procesando...' : 'Guardar cuenta'}
                  </button>
                  <button type="button" onClick={limpiarCuenta} data-cy="cuenta-clear">
                    Limpiar
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={eliminarCuenta}
                    data-cy="cuenta-eliminar"
                  >
                    Cancelar cuenta
                  </button>
                </div>
              </form>
            </div>

            <div className="panel">
              <h2>Operaciones y consultas</h2>
              <div className="field">
                <label>Cuenta ID para operacion</label>
                <input
                  value={operacionCuentaId}
                  onChange={(event) => setOperacionCuentaId(event.target.value)}
                  data-cy="cuenta-operacion-id"
                />
              </div>
              <div className="field">
                <label>Monto</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={operacionMonto}
                  onChange={(event) => setOperacionMonto(event.target.value)}
                  data-cy="cuenta-operacion-monto"
                />
              </div>
              <div className="actions">
                <button
                  type="button"
                  onClick={() => ejecutarOperacion('deposito')}
                  data-cy="cuenta-deposito"
                >
                  Deposito
                </button>
                <button
                  type="button"
                  onClick={() => ejecutarOperacion('retiro')}
                  data-cy="cuenta-retiro"
                >
                  Retiro
                </button>
              </div>

              <div className="field">
                <label>Buscar cuenta por ID</label>
                <div className="inline">
                  <input
                    value={buscarCuentaId}
                    onChange={(event) => setBuscarCuentaId(event.target.value)}
                    placeholder="UUID cuenta"
                    data-cy="cuenta-buscar-id"
                  />
                  <button type="button" onClick={buscarCuenta} data-cy="cuenta-buscar">
                    Buscar
                  </button>
                </div>
              </div>
              <div className="field">
                <label>Listar cuentas por socio</label>
                <div className="inline">
                  <input
                    value={buscarSocioId}
                    onChange={(event) => setBuscarSocioId(event.target.value)}
                    placeholder="UUID socio"
                    data-cy="cuenta-buscar-socio"
                  />
                  <button
                    type="button"
                    onClick={listarCuentasPorSocio}
                    data-cy="cuenta-listar-socio"
                  >
                    Listar
                  </button>
                </div>
              </div>
              <div className="actions">
                <button type="button" onClick={listarCuentas} data-cy="cuenta-listar">
                  Listar todas las cuentas
                </button>
              </div>
              <div className="results">
                <h3>Resultado</h3>
                {cuentaResult ? (
                  <pre data-cy="cuenta-result">
                    {JSON.stringify(cuentaResult, null, 2)}
                  </pre>
                ) : (
                  <p className="muted">Sin resultado cargado</p>
                )}
              </div>
              <div className="results">
                <h3>Lista</h3>
                {cuentasList.length ? (
                  <ul data-cy="cuentas-list">
                    {cuentasList.map((cuenta) => (
                      <li key={cuenta.id}>
                        <strong>{cuenta.numeroCuenta}</strong>
                        <span>{cuenta.estado} - {cuenta.saldo}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Sin cuentas listadas</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'consultas' && (
          <>
            <div className="panel">
              <h2>Validaciones cruzadas</h2>
              <p className="muted">
                Verifica si un socio tiene cuentas activas antes de eliminarlo.
              </p>
              <div className="field">
                <label>Socio ID</label>
                <div className="inline">
                  <input
                    value={consultaSocioId}
                    onChange={(event) => setConsultaSocioId(event.target.value)}
                    placeholder="UUID socio"
                    data-cy="consulta-socio-id"
                  />
                  <button
                    type="button"
                    onClick={validarSocioCuentas}
                    data-cy="consulta-validar"
                  >
                    Validar
                  </button>
                </div>
              </div>
              <div className="results">
                <h3>Resultado validacion</h3>
                {validacionResult ? (
                  <pre data-cy="consulta-result">
                    {JSON.stringify(validacionResult, null, 2)}
                  </pre>
                ) : (
                  <p className="muted">Sin validacion ejecutada</p>
                )}
              </div>
            </div>
            <div className="panel highlight">
              <h2>Checklist operativo</h2>
              <ul className="checklist">
                <li>Socio activo antes de crear cuenta</li>
                <li>Cuentas activas antes de eliminar socio</li>
                <li>Depositos y retiros validados</li>
                <li>Registros auditables por API</li>
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default App;
