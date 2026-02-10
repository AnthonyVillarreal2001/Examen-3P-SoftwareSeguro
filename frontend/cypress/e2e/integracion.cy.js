describe('Integracion UI - Frontend', () => {
  const apiSocios = Cypress.env('API_SOCIOS');
  const apiCuentas = Cypress.env('API_CUENTAS');

  const buildSocioData = (overrides = {}) => {
    const identificacion = `17${Date.now().toString().slice(-8)}`;
    return {
      identificacion,
      nombres: 'Maria',
      apellidos: 'Rodriguez',
      email: `maria.${identificacion}@test.com`,
      telefono: '0999999999',
      direccion: 'Calle 123',
      tipoIdentificacion: 'CEDULA',
      ...overrides,
    };
  };

  const buildCuentaData = (socioId, overrides = {}) => ({
    socioId,
    numeroCuenta: `002-${Date.now().toString().slice(-9)}`,
    saldo: 2000,
    tipoCuenta: 'CORRIENTE',
    ...overrides,
  });

  beforeEach(() => {
    cy.visitApp();
  });

  it('Navega entre pestañas', () => {
    ['socios', 'cuentas', 'consultas'].forEach((tab) => {
      cy.switchToTab(tab);
      cy.get(`[data-cy="tab-${tab}"]`).should('have.class', 'active');
    });
  });

  it('Mantiene datos al cambiar de pestaña', () => {
    const identificacion = `17${Date.now().toString().slice(-8)}`;

    cy.switchToTab('socios');
    cy.get('[data-cy="socio-identificacion"]').type(identificacion);
    cy.get('[data-cy="socio-nombres"]').type('Carlos');

    cy.switchToTab('cuentas');
    cy.switchToTab('socios');

    cy.get('[data-cy="socio-identificacion"]').should('have.value', identificacion);
    cy.get('[data-cy="socio-nombres"]').should('have.value', 'Carlos');
  });

  it('Valida cuentas activas en consultas', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then(() => {
        cy.switchToTab('consultas');
        cy.get('[data-cy="consulta-socio-id"]').type(socioResp.body.id);
        cy.get('[data-cy="consulta-validar"]').click();

        cy.get('[data-cy="consulta-result"]').should('contain.text', 'tieneCuentasActivas');
      });
    });
  });

  it('Muestra validacion sin cuentas activas', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      cy.switchToTab('consultas');
      cy.get('[data-cy="consulta-socio-id"]').type(socioResp.body.id);
      cy.get('[data-cy="consulta-validar"]').click();

      cy.get('[data-cy="consulta-result"]').should('contain.text', 'tieneCuentasActivas');
    });
  });

  it('Muestra error al validar sin socio ID', () => {
    cy.switchToTab('consultas');
    cy.get('[data-cy="consulta-validar"]').click();

    cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'socio ID');
  });

  it('Flujo completo: crear socio, cuenta y deposito', () => {
    const socioData = buildSocioData();

    cy.switchToTab('socios');
    cy.fillSocioForm(socioData);
    cy.get('[data-cy="socio-submit"]').click();
    cy.verifyStatus('Socio creado', 'success');

    cy.get('[data-cy="socio-result"]').invoke('text').then((text) => {
      const socio = JSON.parse(text.trim());

      cy.switchToTab('cuentas');
      const cuentaData = buildCuentaData(socio.id);
      cy.fillCuentaForm(cuentaData);
      cy.get('[data-cy="cuenta-submit"]').click();
      cy.verifyStatus('Cuenta creada', 'success');

      cy.get('[data-cy="cuenta-result"]').invoke('text').then((cuentaText) => {
        const cuenta = JSON.parse(cuentaText.trim());

        cy.get('[data-cy="cuenta-operacion-id"]').type(cuenta.id);
        cy.get('[data-cy="cuenta-operacion-monto"]').clear().type('300');
        cy.get('[data-cy="cuenta-deposito"]').click();
        cy.verifyStatus('Operacion deposito', 'success');
      });
    });
  });
});
