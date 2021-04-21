import Typed from 'typed.js/src/typed';
import { loadStyles, loadTemplate, scroll } from '../utils';

interface HTMLPortalElement extends HTMLElement {
  src: string;
  activate(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    portal: HTMLPortalElement;
  }
}

let typed: Typed;

const configure = async () => {
  await Promise.all([
    loadTemplate('home'),
    loadStyles(process.env.HOME_CSS_OUTPUT),
  ]);
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
          portal.addEventListener('transitionend', () => portal.activate(), {
            once: true,
          });
          portal.setAttribute('aria-hidden', 'false');
          portal.classList.remove('closed');
        });
      });
  }

  if (!typed) {
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
