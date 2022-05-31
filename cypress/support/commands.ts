import '@testing-library/cypress/add-commands';

Cypress.Commands.overwrite('injectAxe', () => {
  cy.task<string>('getAxeSource').then((axeSource) =>
    cy.window({ log: false }).then((window) => {
      const script = window.document.createElement('script');
      script.innerHTML = axeSource;
      window.document.head.appendChild(script);
    }),
  );
});
