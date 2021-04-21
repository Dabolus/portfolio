import { setupServiceWorker } from './utils';
import { configureRouting } from './routing';
import { setupTopBarAnimation } from './animation';

const start = async () => {
  setupServiceWorker();
  configureRouting();
  setupTopBarAnimation();
};

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start, { once: true });
}
