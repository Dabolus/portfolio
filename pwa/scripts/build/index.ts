import { promises as fs } from 'fs';
import path from 'path';
import { buildTemplate } from './templates';
import { buildScripts } from './scripts';
import { buildStyles } from './styles';
import { generateServiceWorkers } from './sw';
import { copyAssets } from './assets';
import { buildSitemap } from './sitemap';
import { Data, LocaleDataModule, Locale } from './models';

const outputPath = path.resolve(__dirname, '../../dist');
const localesPath = path.resolve(__dirname, '../../src/locales');

const getLocalesData = async (): Promise<readonly Data[]> => {
  const locales = await fs.readdir(localesPath);
  const localesData = await Promise.all(
    locales.map(async (localeFile) => {
      const locale = localeFile.slice(0, 2) as Locale;
      const localePath = path.resolve(localesPath, localeFile);
      const { default: data }: LocaleDataModule = await import(localePath);

      return { locale, data };
    }),
  );

  return localesData;
};

const build = async () => {
  const defaultLocale = 'en';
  const localesData = await getLocalesData();
  const production = process.env.NODE_ENV === 'production';
  const defaultData = localesData.find(
    ({ locale }) => locale === defaultLocale,
  );

  await Promise.all([
    ...localesData.map((data) =>
      buildTemplate(path.resolve(outputPath, data.locale), {
        data,
        production,
      }),
    ),
    buildScripts(outputPath, { production, data: defaultData }),
    buildStyles(outputPath, { data: {} }),
    buildSitemap(outputPath, {
      data: localesData,
      priorities: [
        'home',
        'about',
        'projects',
        'certifications',
        'contacts',
        'skills',
        'blog',
      ],
      defaultLocale,
    }),
    copyAssets([
      {
        from: 'src/assets/*',
        to: 'dist',
      },
    ]),
  ]);
  await generateServiceWorkers(outputPath, defaultLocale);
};

build();