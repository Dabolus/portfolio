import path from 'path';
import url from 'url';

export const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const pages = [
  {
    url: '/en/',
    title: 'Home',
  },
  {
    url: '/en/about',
    title: 'About me',
  },
  {
    url: '/en/certifications',
    title: 'Certifications',
  },
  {
    url: '/en/contacts',
    title: 'Contacts',
  },
  {
    url: '/en/projects',
    title: 'Projects',
  },
  {
    url: '/en/skills',
    title: 'Skills',
  },
];
