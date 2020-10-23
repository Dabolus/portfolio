import { registerServiceWorker } from './utils';
import { configureRouting } from './routing';
import { setupTopBarAnimation } from './animation';

const start = async () => {
  registerServiceWorker({ onUpdate: () => window.location.reload() });
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
