import { configureTypingAnimation } from './typing-animation';
import { configureRouting } from './routing';
import { stopAnimation, startAnimation } from './animation';

const smoothScroll = (val?: number) => {
  const scrollingElement =
    document.scrollingElement || document.documentElement;
  const y = typeof val === 'undefined' ? scrollingElement.scrollHeight : val;
  scrollingElement.scroll({
    behavior: 'smooth',
    left: 0,
    top: y,
  });
};

const start = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('{{jsDir}}/sw.js', {
      scope: '/',
    });
  }

  configureTypingAnimation();
  configureRouting();

  // Set up scrolling to the right position when navigating with tabs for accessibility
  document
    .querySelector<HTMLAnchorElement>('#since-2004-link')
    .addEventListener('focus', () => smoothScroll(0));
  document
    .querySelectorAll<HTMLAnchorElement>('#menu > a')
    .forEach(link => link.addEventListener('focus', () => smoothScroll()));
};

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start);
}
