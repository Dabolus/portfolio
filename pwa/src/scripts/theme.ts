import { installMediaQueryWatcher } from 'pwa-helpers';

export const setupThemeChangeObserver = () => {
  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  )!;

  const themeColorUpdateCallback = () =>
    (themeColor.content = getComputedStyle(document.body).getPropertyValue(
      '--theme-content-background',
    ));

  installMediaQueryWatcher(
    '(prefers-color-scheme: dark)',
    themeColorUpdateCallback,
  );
};
