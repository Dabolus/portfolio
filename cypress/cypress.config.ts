import { defineConfig } from 'cypress';
import axe from 'axe-core/axe.js';

export default defineConfig({
  viewportWidth: 1024,
  viewportHeight: 768,
  videoUploadOnPasses: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        getAxeSource: () => axe.source,
      });
    },
  },
});
