import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';

const indexPromise = fs
  .readFile(path.resolve(__dirname, '../index.html'))
  .then(file => file.toString());

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const projectsCollection = db.collection('projects');

const app = express();

app.get('/api/projects', async (_, res) => {
  const projects = await projectsCollection.get();
  res.json(
    projects.docs.map(snapshot => ({
      id: snapshot.id,
      ...snapshot.data(),
    })),
  );
});

app.get('/:page?', async ({ params: { page = 'home' } }, res) => {
  const index = await indexPromise;
  res.send(
    index.replace(/{{(.+)}}/g, (_, match) => {
      switch (match) {
        case 'page':
          return page === 'home' ? 'hidden' : '';
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

export const api = functions.https.onRequest(app);
