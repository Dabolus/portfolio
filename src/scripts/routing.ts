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
    description: 'Curious about who I am? Get to know me and what I do.',
  },
  certifications: {
    title: 'Certifications',
    description: 'Check out my certifications and awards.',
  },
  contacts: {
    title: 'Contacts',
    description:
      'Interested in what I do and/or have some questions? Contact me!',
  },
  projects: {
    title: 'Projects',
    description: 'Check out the list of the projects I built and maintain.',
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
    });
  });
};
