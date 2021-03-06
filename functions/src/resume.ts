import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { Bucket } from '@google-cloud/storage';

enum ResumeError {
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

interface RetrieveResumeBody {
  readonly response: string;
}

let bucket: Bucket;

const validateBody = ({ response }: RetrieveResumeBody) => {
  if (typeof response !== 'string' || !/^[\w-_]+$/.test(response)) {
    throw ResumeError.INVALID_RESPONSE;
  }
};

export const retrieveResume = functions.https.onRequest(
  async (
    {
      body: { ['g-recaptcha-response']: response },
      headers: { ['Fastly-Client-IP']: remoteip },
    },
    res,
  ) => {
    try {
      validateBody({ response });
    } catch (error) {
      res.status(400).json({ error });
      return;
    }

    try {
      const recaptchaRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?${stringify({
          secret: functions.config().recaptcha.secret,
          response,
          ...(remoteip ? { remoteip } : {}),
        })}`,
      );
      const { success } = await recaptchaRes.json();

      if (!success) {
        res.status(400).json({ error: ResumeError.INVALID_RESPONSE });
        return;
      }

      if (!bucket) {
        try {
          admin.initializeApp(functions.config().firebase);
        } catch {}

        bucket = admin.storage().bucket();
      }

      bucket.file('assets/resume.pdf').createReadStream().pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: ResumeError.UNEXPECTED_ERROR });
      return;
    }
  },
);
