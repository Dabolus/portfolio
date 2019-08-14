import { installRouter, updateMetadata } from 'pwa-helpers';
import Typed from 'typed.js/src/typed';

const pages: {
  [key: string]: {
    title?: string;
    description: string;
  };
} = {
  home: {
    description:
      "Hi! I'm Giorgio, a Software Engineer trying to make the web a better place since 2004.",
  },
  'about-me': {
    title: 'About me',
    description: '',
  },
  certifications: {
    title: 'Certifications',
    description: '',
  },
  contacts: {
    title: 'Contacts',
    description: '',
  },
  works: {
    title: 'Works',
    description: '',
  },
};

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

  // Configure routing
  installRouter(({ pathname }) => {
    let path = pathname.substring(1) || 'home';
    if (!Object.keys(pages).includes(path)) {
      window.history.replaceState({}, '', '/');
      path = 'home';
    }
    const { title, description } = pages[path];
    updateMetadata({
      title: title ? `${title} - Giorgio Garasto` : 'Giorgio Garasto',
      description,
      image: 'images/propic.jpg',
      imageAlt: 'Giorgio Garasto',
    });
  });
});
