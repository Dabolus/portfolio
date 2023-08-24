import path from 'node:path';
import { compileTemplate, buildTemplate } from './templates.js';
import { buildScripts } from './scripts.js';
import { buildStyles } from './styles.js';
import { generateServiceWorker } from './sw.js';
import { copyAssets, downloadROMs } from './assets.js';
import { buildSitemap } from './sitemap.js';
import { getData } from '../helpers/data/index.js';
import { getAvailableLocales, setupI18nHelpersMap } from '../helpers/i18n.js';
import { generateStructuredData } from '../helpers/structuredData.js';
import { getConfig } from '../helpers/config.js';
import { setupDatesHelpersMap } from '../helpers/dates.js';
import {
  computeDirname,
  logExecutionTime,
  resolveDependencyPath,
} from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

const outputPath = path.resolve(__dirname, '../../dist');

const build = async () => {
  const [
    config,
    data,
    availableLocales,
    i18nHelpersMap,
    datesHelpersMap,
    portfolioDataAssetsPath,
  ] = await logExecutionTime(
    () =>
      Promise.all([
        getConfig(),
        getData(),
        getAvailableLocales(),
        setupI18nHelpersMap(),
        setupDatesHelpersMap(),
        resolveDependencyPath('@dabolus/portfolio-data/assets'),
      ]),
    'Loading config and data...',
    (time) => `Config and data loaded in ${time}`,
  )();

  const production = process.env.NODE_ENV === 'production';

  const [styles] = await Promise.all([
    logExecutionTime(
      buildStyles,
      'Building styles...',
      (time) => `Styles built in ${time}`,
    )(outputPath, { production, data }),
    logExecutionTime(
      buildSitemap,
      'Building sitemap...',
      (time) => `Sitemap built in ${time}`,
    )(outputPath, {
      baseUrl: config.baseUrl,
      pages: [
        'home',
        'about',
        'projects',
        'certifications',
        'contacts',
        'skills',
      ],
      extraPages: ['90s/', 'cartridges/', 'cartridges/gb/', 'cartridges/gbc/'],
      defaultLocale: config.defaultLocale,
    }),
    logExecutionTime(
      copyAssets,
      'Copying assets...',
      (time) => `Assets copied in ${time}`,
    )([
      {
        from: 'src/assets/*',
        to: 'dist',
      },
      {
        from: `${portfolioDataAssetsPath}/*`,
        to: 'dist',
      },
    ]),
    logExecutionTime(
      downloadROMs,
      'Downloading ROMs...',
      (time) => `ROMs downloaded in ${time}`,
    )('dist/cartridges/roms'),
  ]);

  const scripts = await logExecutionTime(
    buildScripts,
    'Building scripts...',
    (time) => `Scripts built in ${time}`,
  )(outputPath, {
    production,
    stylesOutput: styles,
  });

  await logExecutionTime(
    () =>
      Promise.all([
        compileTemplate(outputPath, {
          partial: true,
          fragment: 'landing',
          outputPath: 'index.html',
          pageData: {
            page: {
              id: 'landing',
              description: 'Landing page',
            },
            config: {
              ...config,
              locale: config.defaultLocale,
            },
            data,
            helpers: {
              ...i18nHelpersMap[config.defaultLocale],
              ...datesHelpersMap[config.defaultLocale],
              generateStructuredData,
            },
            output: { scripts, styles },
          },
          production,
        }),
        ...availableLocales.map((locale) =>
          buildTemplate(path.join(outputPath, locale), {
            data: {
              config: {
                ...config,
                locale,
              },
              data,
              helpers: {
                ...i18nHelpersMap[locale],
                ...datesHelpersMap[locale],
                generateStructuredData,
              },
              output: { scripts, styles },
            },
            production,
          }),
        ),
      ]),
    'Building templates...',
    (time) => `Templates built in ${time}`,
  )();

  await logExecutionTime(
    generateServiceWorker,
    'Generating Service Worker...',
    (time) => `Service Worker generated in ${time}`,
  )(outputPath, availableLocales);
};

logExecutionTime(
  build,
  'Building web app...',
  (time) => `Web app built in ${time}`,
)();
