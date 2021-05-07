import path from 'path';
import { promises as fs } from 'fs';

const localesPath = path.join(__dirname, '../../src/locales');

const availableLocalesPromise = fs
  .readdir(localesPath)
  .then((files) => files.map((file) => file.slice(0, -3)));

export type TranslateFunction = (id: string) => string | string[];

export const getAvailableLocales = (): Promise<readonly string[]> =>
  availableLocalesPromise;

export const parseLocaleFile = (
  content: string,
): Record<string, string | string[]> => {
  // There is always an empty msgid/msgstr at the beginning of a .po file, so we ignore the first match
  const [, ...matches] = Array.from(
    content.matchAll(/msgid (.+?)\nmsgstr (.+?)\n(?:\n|$)/gs),
  );

  return Object.fromEntries(
    matches.map(([, msgid, msgstr]) => {
      // Remove the quotes from the msgid
      const id = msgid.slice(1, -1);

      const str = msgstr
        // Split the msgstr into lines
        .split('\n')
        // Parse each line as JSON to remove the quotes and unescape special characters
        .map((msgPart) => JSON.parse(msgPart))
        // Join the original lines back into a single line
        .join('')
        // Split on the unescaped new lines
        .split('\n');

      // If we have a single line, we just return the first string. Otherwise, we return an array of strings
      return [id, str.length > 1 ? str : str[0]];
    }),
  );
};

export interface I18nHelpers {
  translate: TranslateFunction;
}

export const setupI18nHelpers = async (
  locale: string,
): Promise<I18nHelpers> => {
  const localeFile = await fs.readFile(
    path.join(localesPath, `${locale}.po`),
    'utf8',
  );
  const parsedLocaleFile = parseLocaleFile(localeFile);

  return {
    translate: (id) => parsedLocaleFile[id],
  };
};

export type I18nHelpersMap = Record<string, I18nHelpers>;

export const setupI18nHelpersMap = async (): Promise<I18nHelpersMap> => {
  const locales = await getAvailableLocales();

  const i18nHelpersArray = await Promise.all(
    locales.map(async (locale) => [locale, await setupI18nHelpers(locale)]),
  );

  return Object.fromEntries(i18nHelpersArray);
};
