import { setupLanguageSwitcher } from '../i18n';
import { loadStyles, loadTemplate, logEvent, scroll } from '../utils.js';

interface HTMLPortalElement extends HTMLElement {
  src: string;
  activate(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    portal: HTMLPortalElement;
  }
}

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

  if ('HTMLPortalElement' in window) {
    document
      .querySelectorAll<HTMLAnchorElement>('#menu a[rel="external"]')
      .forEach((externalLink) => {
        const portal = document.querySelector<HTMLPortalElement>(
          `portal#${externalLink.id}-portal`,
        );

        externalLink.addEventListener('click', (e) => {
          e.preventDefault();

          logEvent('page_view', {
            page_title: portal.title,
            page_location: `${location.href}${portal.getAttribute(
              'data-slug',
            )}`,
            page_path: `${location.pathname}${portal.getAttribute(
              'data-slug',
            )}`,
          });

          portal.addEventListener('transitionend', () => portal.activate(), {
            once: true,
          });
          portal.setAttribute('aria-hidden', 'false');
          portal.classList.remove('closed');
        });
      });
  }

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
};

export const onPageUnload = () => {
  if (typed) {
    typed.stop();
  }
};
