import * as functions from 'firebase-functions';

const supportedLocales = ['en'];
const defaultLocale = 'en';

export const redirect = functions.https.onRequest((req, res) => {
  const userLocale = (req.get('Accept-Language') || defaultLocale).slice(0, 2);
  const localeToUse =
    userLocale !== '*' && supportedLocales.includes(userLocale)
      ? userLocale
      : defaultLocale;

  res.redirect(`/${localeToUse}`);
});
