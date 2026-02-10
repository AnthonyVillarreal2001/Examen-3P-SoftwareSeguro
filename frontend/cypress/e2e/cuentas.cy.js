describe('Gestion de Cuentas - Frontend', () => {
  const apiSocios = Cypress.env('API_SOCIOS');
  const apiCuentas = Cypress.env('API_CUENTAS');

  const buildSocioData = (overrides = {}) => {
    const identificacion = `17${Date.now().toString().slice(-8)}`;
    return {
      identificacion,
      nombres: 'Socio Test',
      apellidos: 'Cuenta Test',
      email: `socio.${identificacion}@test.com`,
      telefono: '0999999999',
      direccion: 'Av. Siempre Viva',
      tipoIdentificacion: 'CEDULA',
      ...overrides,
    };
  };

  const buildCuentaData = (socioId, overrides = {}) => ({
    socioId,
    numeroCuenta: `001-${Date.now().toString().slice(-9)}`,
    saldo: 1000.5,
    tipoCuenta: 'AHORRO',
    ...overrides,
  });

  beforeEach(() => {
    cy.visitApp();
    cy.switchToTab('cuentas');
  });

  it('Carga el formulario de cuentas', () => {
    cy.get('[data-cy="cuenta-socio-id"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="cuenta-numero"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="cuenta-saldo"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="cuenta-tipo"]').should('be.visible').and('have.attr', 'required');
    cy.get('[data-cy="cuenta-submit"]').should('contain.text', 'Guardar cuenta');
  });

  it('Crea una nueva cuenta', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((response) => {
      const cuentaData = buildCuentaData(response.body.id);

      cy.fillCuentaForm(cuentaData);
      cy.get('[data-cy="cuenta-submit"]').click();

      cy.verifyStatus('Cuenta creada', 'success');
      cy.get('[data-cy="cuenta-result"]').should('contain.text', cuentaData.numeroCuenta);
    });
  });

  it('Actualiza una cuenta existente', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);
      const actualizado = buildCuentaData(socioResp.body.id, {
        numeroCuenta: `009-${Date.now().toString().slice(-9)}`,
        tipoCuenta: 'CORRIENTE',
      });

      cy.request('POST', apiCuentas, cuentaData).then((cuentaResp) => {
        cy.get('[data-cy="cuenta-id"]').type(cuentaResp.body.id);
        cy.fillCuentaForm(actualizado);
        cy.get('[data-cy="cuenta-submit"]').click();

        cy.verifyStatus('Cuenta actualizada', 'success');
        cy.get('[data-cy="cuenta-result"]').should('contain.text', actualizado.numeroCuenta);
      });
    });
  });

  it('Rechaza numero de cuenta duplicado', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then(() => {
        cy.fillCuentaForm(cuentaData);
        cy.get('[data-cy="cuenta-submit"]').click();

        cy.get('[data-cy="status"]').should('have.class', 'error');
      });
    });
  });

  it('Realiza deposito y retiro', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then((cuentaResp) => {
        cy.get('[data-cy="cuenta-operacion-id"]').type(cuentaResp.body.id);
        cy.get('[data-cy="cuenta-operacion-monto"]').clear().type('250.00');

        cy.get('[data-cy="cuenta-deposito"]').click();
        cy.verifyStatus('Operacion deposito', 'success');

        cy.get('[data-cy="cuenta-operacion-monto"]').clear().type('100.00');
        cy.get('[data-cy="cuenta-retiro"]').click();
        cy.verifyStatus('Operacion retiro', 'success');
      });
    });
  });

  it('Falla deposito con monto invalido', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then((cuentaResp) => {
        cy.get('[data-cy="cuenta-operacion-id"]').type(cuentaResp.body.id);
        cy.get('[data-cy="cuenta-operacion-monto"]').clear().type('-10');
        cy.get('[data-cy="cuenta-deposito"]').click();

        cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'Monto');
      });
    });
  });

  it('Falla retiro con saldo insuficiente', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id, { saldo: 50 });

      cy.request('POST', apiCuentas, cuentaData).then((cuentaResp) => {
        cy.get('[data-cy="cuenta-operacion-id"]').type(cuentaResp.body.id);
        cy.get('[data-cy="cuenta-operacion-monto"]').clear().type('100');
        cy.get('[data-cy="cuenta-retiro"]').click();

        cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'Saldo');
      });
    });
  });

  it('Muestra error si falta ID o monto en operacion', () => {
    cy.get('[data-cy="cuenta-deposito"]').click();

    cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'cuenta ID');
  });

  it('Busca cuenta por ID', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then((cuentaResp) => {
        cy.get('[data-cy="cuenta-buscar-id"]').type(cuentaResp.body.id);
        cy.get('[data-cy="cuenta-buscar"]').click();

        cy.get('[data-cy="cuenta-result"]').should('contain.text', cuentaData.numeroCuenta);
      });
    });
  });

  it('Falla al buscar cuenta inexistente', () => {
    cy.get('[data-cy="cuenta-buscar-id"]').type('00000000-0000-0000-0000-000000000000');
    cy.get('[data-cy="cuenta-buscar"]').click();

    cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'Cuenta');
  });

  it('Lista cuentas por socio', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then(() => {
        cy.get('[data-cy="cuenta-buscar-socio"]').type(socioResp.body.id);
        cy.get('[data-cy="cuenta-listar-socio"]').click();

        cy.get('[data-cy="cuentas-list"]').should('contain.text', cuentaData.numeroCuenta);
      });
    });
  });

  it('Lista todas las cuentas', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then(() => {
        cy.get('[data-cy="cuenta-listar"]').click();

        cy.get('[data-cy="cuentas-list"]').should('contain.text', cuentaData.numeroCuenta);
      });
    });
  });

  it('Elimina cuenta con ID valido', () => {
    const socioData = buildSocioData();

    cy.request('POST', apiSocios, socioData).then((socioResp) => {
      const cuentaData = buildCuentaData(socioResp.body.id);

      cy.request('POST', apiCuentas, cuentaData).then((cuentaResp) => {
        cy.get('[data-cy="cuenta-id"]').type(cuentaResp.body.id);
        cy.get('[data-cy="cuenta-eliminar"]').click();

        cy.verifyStatus('Cuenta eliminada', 'success');
      });
    });
  });

  it('Muestra error al eliminar sin ID', () => {
    cy.get('[data-cy="cuenta-eliminar"]').click();

    cy.get('[data-cy="status"]').should('have.class', 'error').and('contain.text', 'cuenta ID');
  });
});
