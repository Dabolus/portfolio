import { getBasePath } from './path.js';

export const getLocale = () =>
  location.pathname.replace(getBasePath(), '').slice(1, 3);

export const setupLanguageSwitcher = () => {
  const languageSwitcherContainer =
    document.querySelector<HTMLDivElement>('#language');
  const languageSwitcher =
    languageSwitcherContainer.querySelector<HTMLSelectElement>('select');

  languageSwitcherContainer.hidden = false;
  languageSwitcher.addEventListener('change', () => {
    window.location.href = `${getBasePath()}/${languageSwitcher.value}/`;
  });
};
