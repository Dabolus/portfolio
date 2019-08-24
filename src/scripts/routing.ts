import { installRouter, updateMetadata } from 'pwa-helpers';

export const configureRouting = () => {
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

  const home = document.querySelector<HTMLElement>('#home');
  const page = document.querySelector<HTMLElement>('#page');
  const pageTitle = document.querySelector<HTMLHeadingElement>('#title');
  const about = document.querySelector<HTMLDivElement>('#about');
  const projects = document.querySelector<HTMLDivElement>('#projects');
  const certifications = document.querySelector<HTMLDivElement>(
    '#certifications',
  );
  const contacts = document.querySelector<HTMLDivElement>('#contacts');

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

    gtag('config', 'UA-86330876-7', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      page_title: title || 'Home',
    });

    if (path === 'home') {
      home.hidden = false;
      page.hidden = true;
      about.hidden = true;
      projects.hidden = true;
      certifications.hidden = true;
      contacts.hidden = true;
    } else {
      pageTitle.textContent = title;
      home.hidden = true;
      page.hidden = false;
      about.hidden = path !== 'about';
      projects.hidden = path !== 'projects';
      certifications.hidden = path !== 'certifications';
      contacts.hidden = path !== 'contacts';
    }
  });
};
