import { setupLanguageSwitcher } from '../i18n';
import { loadStyles, loadTemplate, logEvent, scroll } from '../utils.js';

let typed: typeof import('typed.js/src/typed')['default']['prototype'];

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('home'),
    loadStyles(import.meta.env.HOME_CSS_OUTPUT),
  ]);

  applyTemplate();
  setupLanguageSwitcher();
};

const configurationPromise = configure();

export const onPageLoad = async () => {
  await configurationPromise;

  // Set up scrolling to the right position when navigating with tabs for accessibility
  document
    .querySelector<HTMLAnchorElement>('#since-2004-link')
    .addEventListener('focus', () => scroll({ val: 0 }));
  document
    .querySelectorAll<HTMLAnchorElement>('#menu a:not([rel="external"])')
    .forEach((link) => link.addEventListener('focus', () => scroll()));

  // If running E2E tests, replace the typed animation with a static string to simplify visual diff testing
  if ('Cypress' in window) {
    document.querySelector('#typed').innerHTML = document.querySelector(
      '#strings > :first-child',
    ).innerHTML;
  } else {
    // Otherwise, setup Typed.js
    if (!typed) {
      const { default: Typed } = await import('typed.js/src/typed');
      // Configure typing animation
      typed = new Typed('#typed', {
        backDelay: 2000,
        backSpeed: 30,
        loop: true,
        showCursor: false,
        smartBackspace: false,
        startDelay: 0,
        stringsElement: '#strings',
        typeSpeed: 90,
      });
    } else {
      typed.start();
    }
  }
};

export const onPageUnload = () => {
  if (typed) {
    typed.stop();
  }
};
