import { setupLanguageSwitcher } from '../i18n.js';
import { setupTimeMachine } from '../timeMachine.js';
import { loadStyles, loadTemplate, scroll } from '../utils.js';

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('home'),
    loadStyles(import.meta.env.HOME_CSS_OUTPUT),
  ]);

  applyTemplate();
  setupLanguageSwitcher();
  setupTimeMachine();
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
};
