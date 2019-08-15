import Typed from 'typed.js/src/typed';

export const configureTypingAnimation = () => {
  // Configure typing animation
  new Typed('#typed', {
    backDelay: 2000,
    backSpeed: 30,
    loop: true,
    showCursor: false,
    smartBackspace: false,
    startDelay: 0,
    stringsElement: '#strings',
    typeSpeed: 90,
  });
};
