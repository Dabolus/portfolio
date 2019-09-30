import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CollectionReference } from '@google-cloud/firestore';

let certificationsCollection: CollectionReference;

export const getCertifications = functions.https.onRequest(async (_, res) => {
  if (!certificationsCollection) {
    try {
      admin.initializeApp(functions.config().firebase);
    } catch {}
    certificationsCollection =
      certificationsCollection ||
      admin.firestore().collection('certifications');
  }

  const certifications = await certificationsCollection
    .where('published', '==', true)
    .get();

  res.json(
    certifications.docs.map(snapshot => ({
      id: snapshot.id,
      ...snapshot.data(),
    })),
  );
});
