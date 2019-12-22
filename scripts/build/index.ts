import { promises as fs } from 'fs';
import path from 'path';
import { buildTemplate } from './templates';

const outputPath = path.resolve(__dirname, '../../dist');
const localesPath = path.resolve(__dirname, '../../src/locales');

const getLocalesData = async () => {
  const locales = await fs.readdir(localesPath);
  const localesData = await Promise.all(
    locales.map(async localeFile => {
      const locale = localeFile.slice(0, 2);
      const localePath = path.resolve(localesPath, localeFile);
      const { default: localeData } = await import(localePath);

      return { locale, localeData };
    }),
  );

  return localesData;
};

const build = async () => {
  const localesData = await getLocalesData();

  await Promise.all([
    ...localesData.map(({ locale, localeData }) =>
      buildTemplate(path.resolve(outputPath, `${locale}.html`), localeData),
    ),
  ]);
};

build();
