import { promises as fs } from 'fs';
import path from 'path';
import { buildTemplate } from './templates';

const outputPath = path.resolve(__dirname, '../../dist');
const localesPath = path.resolve(__dirname, '../../src/locales');

const getLocalesData = async () => {
  const locales = await fs.readdir(localesPath);
  const localesData = await Promise.all(
    locales.map(async locale => {
      const localePath = path.resolve(localesPath, locale);
      const { default: localeData } = await import(localePath);

      return localeData;
    }),
  );

  return localesData;
};

const build = async () => {
  const localesData = await getLocalesData();

  await Promise.all(
    localesData.map(localeData =>
      buildTemplate(path.resolve(outputPath, 'en.html'), localeData),
    ),
  );
};

build();
