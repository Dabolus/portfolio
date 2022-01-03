describe('accessibility', () => {
  ['home', 'about', 'certifications', 'contacts', 'projects', 'skills'].forEach(
    (page) => {
      it(`is accessible in the ${page} page`, () => {
        cy.visit(`/en/${page === 'home' ? '' : page}`);
        cy.injectAxe();
        cy.checkA11y();
      });
    },
  );
});
