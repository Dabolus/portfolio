describe('accessibility', () => {
  ['home', 'about', 'certifications', 'contacts', 'projects', 'skills'].forEach(
    (page) => {
      it(`is accessible in the ${page} page`, () => {
        cy.visit(`/en/${page === 'home' ? '' : page}`);
        cy.injectAxe();
        cy.checkA11y();
        // Take a snapshot to check the visual diff of the page
        cy.percySnapshot(`${page[0].toUpperCase()}${page.slice(1)}`, {
          percyCSS: `
            html {
              height: 100vh !important;
              overflow: hidden !important;
            }

            #typed > li {
              animation: none !important;
              visibility: hidden !important;
            }

            #typed > li:first-child {
              visibility: visible !important;
              width: auto !important;
            }
          `,
        });
      });
    },
  );
});
