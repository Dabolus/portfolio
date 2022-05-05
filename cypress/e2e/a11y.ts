describe('accessibility', () => {
  ['home', 'about', 'certifications', 'contacts', 'projects', 'skills'].forEach(
    (page) => {
      it(`is accessible in the ${page} page`, () => {
        cy.visit(`/en/${page === 'home' ? '' : page}`);
        cy.injectAxe();
        cy.checkA11y(
          undefined,
          // TOOD: re-enable empty-heading rule when Typed.js accessibility issues are fixed
          page === 'home'
            ? {
                rules: {
                  'empty-heading': { enabled: false },
                },
              }
            : undefined,
        );
        // Take a snapshot to check the visual diff of the page
        cy.percySnapshot(`${page[0].toUpperCase()}${page.slice(1)}`);
      });
    },
  );
});
