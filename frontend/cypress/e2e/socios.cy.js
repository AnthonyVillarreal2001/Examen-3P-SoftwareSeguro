describe('Gestion de Socios - Frontend', () => {
  const apiSocios = Cypress.env('API_SOCIOS');
  const apiCuentas = Cypress.env('API_CUENTAS');

  const buildSocioData = (overrides = {}) => {
    const identificacion = `17${Date.now().toString().slice(-8)}`;
    return {
      identificacion,
      nombres: 'Juan Carlos',
      apellidos: 'Perez Gonzalez',
      email: `juan.${identificacion}@test.com`,
      telefono: '0999999999',
      direccion: 'Av. Amazonas 123',
      tipoIdentificacion: 'CEDULA',
      ...overrides,
    };
  };

  const buildCuentaData = (socioId) => ({
    socioId,
    numeroCuenta: `001-${Date.now().toString().slice(-9)}`,
    saldo: 1000.5,
    tipoCuenta: 'AHORRO',
  });

  beforeEach(() => {
    cy.visitApp();
    cy.switchToTab('socios');
  });

  it('Carga el formulario de socios', () => {
    cy.get('[data-cy="socio-identificacion"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="socio-nombres"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="socio-apellidos"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="socio-tipo-identificacion"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="socio-submit"]').should('contain.text', 'Guardar socio');
  });

  it('Bloquea envio con campos requeridos vacios', () => {
    cy.get('[data-cy="socio-submit"]').click();

    cy.get('[data-cy="socio-identificacion"]').then(($input) => {
      expect($input[0].checkValidity()).to.eq(false);
    });
  });

  it('Crea un nuevo socio', () => {
    const socioData = buildSocioData();

    cy.fillSocioForm(socioData);
    cy.get('[data-cy="socio-submit"]').click();

    cy.verifyStatus('Socio creado', 'success');
    cy.get('[data-cy="socio-result"]').should('contain.text', socioData.nombres);
  });

  it('Actualiza un socio existente', () => {
    const socioData = buildSocioData();
    const updated = buildSocioData({
      identificacion: socioData.identificacion,
      nombres: 'Nombre Actualizado',
      apellidos: 'Apellido Actualizado',
    });

    cy.request('POST', apiSocios, socioData).then((response) => {
      cy.get('[data-cy="socio-id"]').type(response.body.id);
      cy.fillSocioForm(updated);
      cy.get('[data-cy="socio-submit"]').click();

      cy.verifyStatus('Socio actualizado', 'success');
      cy.get('[data-cy="socio-result"]').should('contain.text', updated.nombres);
    });
  });

  it('Falla al actualizar con UUID invalido', () => {
    const socioData = buildSocioData();

    cy.get('[data-cy="socio-id"]').type('123');
    cy.fillSocioForm(socioData);
    cy.get('[data-cy="socio-submit"]').click();

    cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'UUID');
  });

  it('Busca socio por identificacion', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then(() => {
      cy.get('[data-cy="socio-buscar-identificacion"]').type(socioData.identificacion);
      cy.get('[data-cy="socio-buscar"]').click();

      cy.get('[data-cy="socio-result"]').should('contain.text', socioData.identificacion);
    });
  });

  it('Muestra error al buscar sin identificacion', () => {
    cy.get('[data-cy="socio-buscar"]').click();

    cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'identificacion');
  });

  it('Lista socios existentes', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then(() => {
      cy.get('[data-cy="socio-listar"]').click();

      cy.get('[data-cy="socios-list"]').should('contain.text', socioData.identificacion);
    });
  });

  it('Evita crear socio con identificacion duplicada', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then(() => {
      cy.fillSocioForm(socioData);
      cy.get('[data-cy="socio-submit"]').click();

      cy.get('[data-cy="status"]').should('have.class', 'error');
    });
  });

  it('Muestra error al eliminar sin ID', () => {
    cy.get('[data-cy="socio-eliminar"]').click();

    cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'socio ID');
  });

  it('Bloquea eliminar socio con cuentas activas', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then(() => {
        cy.get('[data-cy="socio-id"]').type(socioResp.body.id);
        cy.get('[data-cy="socio-eliminar"]').click();

        cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'No se puede eliminar');
      });
    });
  });

  it('Elimina socio sin cuentas activas', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((response) => {
      cy.get('[data-cy="socio-id"]').type(response.body.id);
      cy.get('[data-cy="socio-eliminar"]').click();

      cy.verifyStatus('Socio eliminado', 'success');
      cy.get('[data-cy="socio-id"]').should('have.value', '');
    });
  });

  it('Limpia el formulario', () => {
    cy.fillSocioForm({
      identificacion: '1712345678',
      nombres: 'Test',
      apellidos: 'User',
    });

    cy.get('[data-cy="socio-clear"]').click();

    cy.get('[data-cy="socio-identificacion"]').should('have.value', '');
    cy.get('[data-cy="socio-nombres"]').should('have.value', '');
    cy.get('[data-cy="socio-apellidos"]').should('have.value', '');
    cy.get('[data-cy="socio-id"]').should('have.value', '');
  });
});
