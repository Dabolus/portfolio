import { setupServiceWorker } from './utils';
import { configureRouting } from './routing';
import { setupTopBarAnimation } from './animation';
import { setupThemeChangeObserver } from './theme';
import { setupI18n } from './i18n';

const start = async () => {
  setupServiceWorker();
  configureRouting();
  setupTopBarAnimation();
  setupThemeChangeObserver();
  setupI18n();
};

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start, { once: true });
}
