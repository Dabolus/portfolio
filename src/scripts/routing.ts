import { installRouter, updateMetadata } from 'pwa-helpers';

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
  about: {
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

export const configureRouting = () => {
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
};
