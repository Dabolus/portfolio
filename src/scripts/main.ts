import { configureTypingAnimation } from './typing-animation';
import { configureRouting } from './routing';
import { stopAnimation, startAnimation } from './animation';
import { scroll } from './utils';

const start = () => {
  if (process.env.ENABLE_DEV_SW && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('{{jsDir}}/sw.js', {
      scope: '/',
    });
  }

  configureTypingAnimation();
  configureRouting();

  // Set up scrolling to the right position when navigating with tabs for accessibility
  document
    .querySelector<HTMLAnchorElement>('#since-2004-link')
    .addEventListener('focus', () => scroll({ val: 0 }));
  document
    .querySelectorAll<HTMLAnchorElement>('#menu > a')
    .forEach(link => link.addEventListener('focus', () => scroll()));
};

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start);
}
