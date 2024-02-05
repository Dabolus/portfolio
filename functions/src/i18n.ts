import { onRequest } from 'firebase-functions/v2/https';

const supportedLanguages = ['en', 'it'];

export const redirectToPreferredLocale = onRequest((req, res) => {
  const chosenLanguage =
    req.acceptsLanguages(supportedLanguages) || supportedLanguages[0];
  return res.redirect(302, `/${chosenLanguage}/`);
});
