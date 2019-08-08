import * as functions from 'firebase-functions';
import express from 'express';

const app = express();

app.get('/api/test', (req, res) => {
  res.json({ hello: 'world' });
});

export const api = functions.https.onRequest(app);
