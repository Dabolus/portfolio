import path from 'path';
import { buildTemplate } from './templates';
import { buildScripts } from './scripts';
import { buildStyles } from './styles';
import { generateServiceWorker } from './sw';
import { copyAssets } from './assets';
// import { buildSitemap } from './sitemap';
import { getData } from '../helpers/data';
import {
  defaultLocale,
  getAvailableLocales,
  setupI18nHelpersMap,
} from '../helpers/i18n';
import { getConfig } from '../helpers/config';
import { setupDatesHelpersMap } from '../helpers/dates';

const outputPath = path.resolve(__dirname, '../../dist');

const build = async () => {
  const [
    config,
    data,
    availableLocales,
    i18nHelpersMap,
    datesHelpersMap,
  ] = await Promise.all([
    getConfig(),
    getData(),
    getAvailableLocales(),
    setupI18nHelpersMap(),
    setupDatesHelpersMap(),
  ]);

  const production = process.env.NODE_ENV === 'production';

  const [styles] = await Promise.all([
    buildStyles(outputPath, { production }),
    // TODO: refactor sitemap using EJS
    // buildSitemap(outputPath, {
    //   data: localesData,
    //   priorities: [
    //     'home',
    //     'about',
    //     'projects',
    //     'certifications',
    //     'contacts',
    //     'skills',
    //     'blog',
    //   ],
    //   defaultLocale,
    // }),
    copyAssets([
      {
        from: 'src/assets/*',
        to: 'dist',
      },
    ]),
  ]);

  const scripts = await buildScripts(outputPath, {
    production,
    stylesOutput: styles,
  });

  await Promise.all(
    availableLocales.map((locale) =>
      buildTemplate(path.resolve(outputPath, locale), {
        data: {
          config: {
            ...config,
            locale,
          },
          data,
          helpers: {
            ...i18nHelpersMap[locale],
            ...datesHelpersMap[locale],
          },
          output: { scripts, styles },
        },
        production,
      }),
    ),
  );

  await generateServiceWorker(outputPath, { defaultLocale });
};

build();
