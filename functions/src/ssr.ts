import * as functions from 'firebase-functions';
import { promises as fs } from 'fs';
import path from 'path';

const indexPromise = fs
  .readFile(path.resolve(__dirname, '../index.hbs'))
  .then(file => file.toString());

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
  skills: {
    title: 'Skills',
    description: 'Want to know what I am good at? Check it out here.',
  },
};

export const ssr = functions.https.onRequest(async ({ path = '/' }, res) => {
  const page = path.slice(1) || 'home';
  const index = await indexPromise;

  res.send(
    index.replace(/{{(.+?)}}/g, (_, match) => {
      switch (match) {
        case 'title':
          return pages[page].title
            ? `${pages[page].title} - Giorgio Garasto`
            : 'Giorgio Garasto';
        case 'description':
          return pages[page].description;
        case 'url':
          return `https://giorgio.garasto.it${
            page === 'home' ? '' : `/${page}`
          }`;
        case 'page':
          return page === 'home' ? 'aria-hidden="true"' : '';
        case 'home':
          return page !== 'home' ? 'aria-hidden="true"' : '';
        case 'pageTitle':
          return pages[page].title || '';
        case 'age':
          return (
            (Date.now() - 873148830000) / // 1st Sep 1997 at 23:20:30
            31556926000
          ) // 1 year (365 days, 5 hours, 48 minutes and 46 seconds)
            .toFixed(9);
        default:
          return page === match ? '' : 'hidden';
      }
    }),
  );
});
