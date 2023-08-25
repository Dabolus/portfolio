import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import percySnapshot from '@percy/playwright';

test.describe('accessibility', () => {
  ['home', 'about', 'certifications', 'contacts', 'projects', 'skills'].forEach(
    (pageId) => {
      test(`is accessible in the ${pageId} page`, async ({ page }) => {
        await page.goto(`/en/${pageId === 'home' ? '' : pageId}`);
        const accessibilityScanResults = await new AxeBuilder({
          page,
        }).analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
        // Take a snapshot to check the visual diff of the page
        await percySnapshot(
          page,
          `${pageId[0].toUpperCase()}${pageId.slice(1)}`,
          {
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
          },
        );
      });
    },
  );
});
