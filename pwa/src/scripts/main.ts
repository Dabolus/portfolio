import { setupServiceWorker } from './utils';
import { configureRouting } from './routing';
import { setupTopBarAnimation } from './animation';
import { setupThemeChangeObserver } from './theme';

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
