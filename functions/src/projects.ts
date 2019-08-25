import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const projectsCollection = db.collection('projects');

export const getProjects = functions.https.onRequest(async (_, res) => {
  const projects = await projectsCollection.get();
  res.json(
    projects.docs.map(snapshot => ({
      id: snapshot.id,
      ...snapshot.data(),
    })),
  );
});
