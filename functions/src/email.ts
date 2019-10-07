import * as functions from 'firebase-functions';

export const sendEmail = functions.https.onRequest(
  async (
    {
      body: {
        name,
        email,
        subject,
        message,
        ['g-recaptcha-response']: response,
      },
      headers: { ['Fastly-Client-IP']: remoteip },
    },
    res,
  ) => {
    // TODO: verify input fields and send email

    const recaptchaRes = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          secret: functions.config().recaptcha.secret,
          response,
          remoteip,
        }),
      },
    );
    const { success } = await recaptchaRes.json();

    res.json({ success });
  },
);
