import Typed from 'typed.js';

document.addEventListener('DOMContentLoaded', () => {
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
});
