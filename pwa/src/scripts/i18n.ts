export const getLocale = () => location.pathname.slice(1, 3);

export const setupI18n = () => {
  const languageSwitcherContainer = document.querySelector<HTMLDivElement>(
    '#language',
  );
  const languageSwitcher = languageSwitcherContainer.querySelector<HTMLSelectElement>(
    'select',
  );

  languageSwitcherContainer.hidden = false;
  languageSwitcher.addEventListener('change', () => {
    window.location.href = `/${languageSwitcher.value}/`;
  });
};
