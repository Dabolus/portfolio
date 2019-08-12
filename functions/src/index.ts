import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import express from 'express';

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

export const api = functions.https.onRequest(app);
