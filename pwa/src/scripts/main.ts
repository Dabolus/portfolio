import { configureRouting } from './routing';

const start = () => {
  if (process.env.ENABLE_DEV_SW && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${process.env.JS_DIR}/sw.js`, {
      scope: '/',
    });
  }
  configureRouting();
};

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start, { once: true });
}