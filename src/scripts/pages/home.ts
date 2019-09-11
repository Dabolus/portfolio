import { configureTypingAnimation } from '../typing-animation';
import { scroll } from '../utils';

configureTypingAnimation();

// Set up scrolling to the right position when navigating with tabs for accessibility
document
  .querySelector<HTMLAnchorElement>('#since-2004-link')
  .addEventListener('focus', () => scroll({ val: 0 }));
document
  .querySelectorAll<HTMLAnchorElement>('#menu > a')
  .forEach(link => link.addEventListener('focus', () => scroll()));
