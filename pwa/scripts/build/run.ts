import path from 'node:path';
import { buildTemplate } from './templates.js';
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
  const buildDate = new Date();
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
        resolveDependencyPath('@dabolus/portfolio-data').then((packagePath) =>
          path.resolve(packagePath, 'assets'),
        ),
      ]),
    'Loading \x1b[35mconfig and data\x1b[0m...',
    (time) => `\x1b[35mConfig and data\x1b[0m loaded in \x1b[36m${time}\x1b[0m`,
  )();

  const production = process.env.NODE_ENV === 'production';

  const [styles] = await Promise.all([
    logExecutionTime(
      buildStyles,
      'Building \x1b[35mstyles\x1b[0m...',
      (time) => `\x1b[35mStyles\x1b[0m built in \x1b[36m${time}\x1b[0m`,
    )(outputPath, { production, data }),
    logExecutionTime(
      buildSitemap,
      'Building \x1b[35msitemap\x1b[0m...',
      (time) => `\x1b[35mSitemap\x1b[0m built in \x1b[36m${time}\x1b[0m`,
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
      helpers: {
        ...i18nHelpersMap[config.defaultLocale],
        ...datesHelpersMap[config.defaultLocale],
        generateStructuredData,
      },
      buildDate,
    }),
    logExecutionTime(
      copyAssets,
      'Copying \x1b[35massets\x1b[0m...',
      (time) => `\x1b[35mAssets\x1b[0m copied in \x1b[36m${time}\x1b[0m`,
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
      'Downloading \x1b[35mROMs\x1b[0m...',
      (time) => `\x1b[35mROMs\x1b[0m downloaded in \x1b[36m${time}\x1b[0m`,
    )('dist/cartridges/roms'),
  ]);

  const scripts = await logExecutionTime(
    buildScripts,
    'Building \x1b[35mscripts\x1b[0m...',
    (time) => `\x1b[35mScripts\x1b[0m built in \x1b[36m${time}\x1b[0m`,
  )(outputPath, {
    production,
    stylesOutput: styles,
  });

  await logExecutionTime(
    () =>
      Promise.all(
        availableLocales.map((locale) =>
          buildTemplate(path.join(outputPath, locale), {
            data: {
              config: {
                ...config,
                locale,
                production,
              },
              data,
              helpers: {
                ...i18nHelpersMap[locale],
                ...datesHelpersMap[locale],
                generateStructuredData,
              },
              output: { scripts, styles },
              buildDate,
            },
            production,
          }),
        ),
      ),
    'Building \x1b[35mtemplates\x1b[0m...',
    (time) => `\x1b[35mTemplates\x1b[0m built in \x1b[36m${time}\x1b[0m`,
  )();

  await logExecutionTime(
    generateServiceWorker,
    'Generating \x1b[35mService Worker\x1b[0m...',
    (time) =>
      `\x1b[35mService Worker\x1b[0m generated in \x1b[36m${time}\x1b[0m`,
  )(outputPath, availableLocales);
};

logExecutionTime(
  build,
  'Building \x1b[35mweb app\x1b[0m...',
  (time) => `\x1b[35mWeb app\x1b[0m built in \x1b[36m${time}\x1b[0m`,
)();
