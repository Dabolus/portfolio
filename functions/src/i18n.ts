import { onRequest } from 'firebase-functions/v2/https';

const supportedLanguages = ['en', 'it'];
const [defaultLanguage] = supportedLanguages;

const localizedSlugs: Record<string, Record<string, string>> = {
  about: {
    en: 'about',
    it: 'chi-sono',
  },
  certifications: {
    en: 'certifications',
    it: 'certificazioni',
  },
  contacts: {
    en: 'contacts',
    it: 'contatti',
  },
  projects: {
    en: 'projects',
    it: 'progetti',
  },
  skills: {
    en: 'skills',
    it: 'abilita',
  },
};

export const redirectToPreferredLocale = onRequest((req, res) => {
  const pageId = req.path.slice(1);
  const chosenLanguage =
    req.acceptsLanguages(supportedLanguages) || defaultLanguage;
  const localizedSlug =
    localizedSlugs[pageId]?.[chosenLanguage] ||
    localizedSlugs[pageId]?.[defaultLanguage] ||
    pageId;
  return res.redirect(302, `/${chosenLanguage}/${localizedSlug}`);
});
