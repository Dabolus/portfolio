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
      const { default: data } = await import(localePath);

      return { locale, data };
    }),
  );

  return localesData;
};

const build = async () => {
  const localesData = await getLocalesData();

  await Promise.all([
    ...localesData.map(data =>
      buildTemplate(path.resolve(outputPath, `${data.locale}.html`), {
        data,
        production: process.env.NODE_ENV === 'production',
      }),
    ),
  ]);
};

build();
