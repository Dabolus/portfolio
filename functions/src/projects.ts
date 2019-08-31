import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CollectionReference } from '@google-cloud/firestore';

let projectsCollection: CollectionReference;

export const getProjects = functions.https.onRequest(async (_, res) => {
  if (!projectsCollection) {
    try {
      admin.initializeApp(functions.config().firebase);
    } catch {}
    projectsCollection =
      projectsCollection || admin.firestore().collection('projects');
  }

  const projects = await projectsCollection
    .where('published', '==', true)
    .get();

  res.json(
    projects.docs.map(snapshot => ({
      id: snapshot.id,
      ...snapshot.data(),
    })),
  );
});
