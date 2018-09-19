import * as functions from 'firebase-functions';
import * as express from 'express';
import * as prpl from 'prpl-server';
import * as rendertron from 'rendertron-middleware';

const expressApp = express();
const rendertronMiddleware = rendertron.makeMiddleware({
  proxyUrl: 'https://render-tron.appspot.com/render',
  injectShadyDom: true,
});

expressApp.get('/api', (req, res) => {
  // TODO: get this data in real time (LinkedIn/GitHub API or whatever)
  res.json({
    name: 'Giorgio Garasto',
    bio: 'Google certified Mobile Web Specialist, passionate developer and graphic designer.',
    summary: 'I put my hands on HTML for the first time when I was seven years old to help my father, and I\'ve never stopped playing with it since then. The passion for web developing influenced both my work and study choices, and brought me to gain a scholarship from Google and Udacity that gave me the chance to obtain the Mobile Web Specialist certification. At work I gained a vast experience in front end development by means of frameworks such as Angular and React, as well as using native technologies, like Web Components and Service Workers. On the back end side, I mainly use Node.js and Go.\n\nOutside the working world, I like devoting myself to music. I love playing guitar and singing, but I do dabble also with piano and drums.',
    job: {
      title: 'Software Engineer',
      company: {
        name: 'MOLO17 SRL',
        size: '11-50',
      },
    },
  });
});

expressApp.use((req, res, next) => {
  req.headers['Host'] = 'giorgio.garasto.it';
  return rendertronMiddleware(req, res, next);
});

expressApp.get('/*', prpl.makeHandler('./build', {
  entrypoint: 'index.html',
  builds: [{
    name: 'es6',
    browserCapabilities: ['es2015'],
  }, {
    name: 'es5',
  }],
}));

export const app = functions.https.onRequest(expressApp);
