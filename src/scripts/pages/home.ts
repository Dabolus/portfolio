import Typed from 'typed.js/src/typed';
import { scroll } from '../utils';

// Set up scrolling to the right position when navigating with tabs for accessibility
document
  .querySelector<HTMLAnchorElement>('#since-2004-link')
  .addEventListener('focus', () => scroll({ val: 0 }));
document
  .querySelectorAll<HTMLAnchorElement>('#menu > a')
  .forEach(link => link.addEventListener('focus', () => scroll()));

let typed: Typed;

export const onPageLoad = () => {
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
