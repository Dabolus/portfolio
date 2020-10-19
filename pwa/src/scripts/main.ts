import { configureRouting } from './routing';
import { setupTopBarAnimation } from './animation';

const start = () => {
  if (process.env.ENABLE_DEV_SW && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${process.env.JS_DIR}/sw.js`, {
      scope: '/',
    });
  }
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
