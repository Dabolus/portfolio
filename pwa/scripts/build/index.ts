import { promises as fs } from 'fs';
import path from 'path';
import { buildTemplate } from './templates';
import { buildScripts } from './scripts';
import { buildStyles } from './styles';
import { generateServiceWorker } from './sw';
import { copyAssets } from './assets';
import { buildSitemap } from './sitemap';
import { Data, LocaleDataModule, Locale } from './models';
import { getDynamicData } from '../helpers/data';

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
  const [localesData, dynamicData] = await Promise.all([
    getLocalesData(),
    getDynamicData(),
  ]);
  const production = process.env.NODE_ENV === 'production';
  const defaultData = localesData.find(
    ({ locale }) => locale === defaultLocale,
  );

  const [styles] = await Promise.all([
    buildStyles(outputPath, { production, data: {} }),
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

  const scripts = await buildScripts(outputPath, {
    production,
    data: defaultData,
    stylesOutput: styles,
  });

  await Promise.all(
    localesData.map((data) =>
      buildTemplate(path.resolve(outputPath, data.locale), {
        data: {
          ...data,
          data: {
            ...data.data,
            ...dynamicData,
          },
        },
        output: { scripts, styles },
        production,
      }),
    ),
  );

  await generateServiceWorker(outputPath, { defaultLocale });
};

build();
