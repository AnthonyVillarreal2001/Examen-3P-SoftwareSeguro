Cypress.Commands.add('visitApp', () => {
  cy.visit('/', {
    timeout: 10000,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('switchToTab', (tabName) => {
  const tabId = String(tabName || '').toLowerCase();
  cy.get(`[data-cy="tab-${tabId}"]`).click();
  cy.get(`[data-cy="tab-${tabId}"]`).should('have.class', 'active');
});

Cypress.Commands.add('fillSocioForm', (data) => {
  if (data.identificacion !== undefined) {
    cy.get('[data-cy="socio-identificacion"]').clear().type(String(data.identificacion));
  }
  if (data.nombres !== undefined) {
    cy.get('[data-cy="socio-nombres"]').clear().type(String(data.nombres));
  }
  if (data.apellidos !== undefined) {
    cy.get('[data-cy="socio-apellidos"]').clear().type(String(data.apellidos));
  }
  if (data.email !== undefined) {
    cy.get('[data-cy="socio-email"]').clear().type(String(data.email));
  }
  if (data.telefono !== undefined) {
    cy.get('[data-cy="socio-telefono"]').clear().type(String(data.telefono));
  }
  if (data.direccion !== undefined) {
    cy.get('[data-cy="socio-direccion"]').clear().type(String(data.direccion));
  }
  if (data.tipoIdentificacion) {
    cy.get('[data-cy="socio-tipo-identificacion"]').select(data.tipoIdentificacion);
  }
});

Cypress.Commands.add('fillCuentaForm', (data) => {
  if (data.socioId !== undefined) {
    cy.get('[data-cy="cuenta-socio-id"]').clear().type(String(data.socioId));
  }
  if (data.numeroCuenta !== undefined) {
    cy.get('[data-cy="cuenta-numero"]').clear().type(String(data.numeroCuenta));
  }
  if (data.saldo !== undefined) {
    cy.get('[data-cy="cuenta-saldo"]').clear().type(String(data.saldo));
  }
  if (data.tipoCuenta) {
    cy.get('[data-cy="cuenta-tipo"]').select(data.tipoCuenta);
  }
});

Cypress.Commands.add('verifyStatus', (expectedText, type = 'success') => {
  cy.get('[data-cy="status"]', { timeout: 5000 })
    .should('be.visible')
    .and('contain.text', expectedText)
    .and('have.class', type);
});
