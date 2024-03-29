import { setupServiceWorker } from './utils.js';
import { configureRouting } from './routing.js';
import { setupTopBarAnimation } from './animation.js';
import { setupThemeChangeObserver } from './theme.js';

const start = async () => {
  setupServiceWorker();
  configureRouting();
  setupTopBarAnimation();
  setupThemeChangeObserver();
};

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start, { once: true });
}
