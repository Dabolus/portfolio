import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { debounce } from 'lodash';
import browserSync from 'browser-sync';
import { buildTemplate } from '../build/templates';
import { buildScripts } from '../build/scripts';
import { buildStyles } from '../build/styles';
import { generateServiceWorker } from '../build/sw';
import { copyAssets } from '../build/assets';
import { Output } from '../build/models';
import { getConfig } from '../helpers/config';
import {
  defaultLocale,
  getAvailableLocales,
  setupI18nHelpersMap,
} from '../helpers/i18n';
import { setupDatesHelpersMap } from '../helpers/dates';
import { getData } from '../helpers/data';

const outputPath = path.resolve(__dirname, '../../dist');

const output: Output = {
  scripts: {
    main: 'scripts/main.js',
    home: 'scripts/pages/home.js',
    about: 'scripts/pages/about.js',
    certifications: 'scripts/pages/certifications.js',
    contacts: 'scripts/pages/contacts.js',
    projects: 'scripts/pages/projects.js',
    skills: 'scripts/pages/skills.js',
    utils: 'scripts/utils.js',
    animation: 'scripts/animation.js',
  },
  styles: {
    main: 'styles/main.css',
    home: 'styles/home.css',
    about: 'styles/pages/about.css',
    certifications: 'styles/pages/certifications.css',
    contacts: 'styles/pages/contacts.css',
    projects: 'styles/pages/projects.css',
    skills: 'styles/pages/skills.css',
  },
};

const start = async () => {
  const cwd = path.resolve(__dirname, '../..');
  const bs = browserSync.create();

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

  chokidar.watch(['src/index.ejs', 'src/fragments/**/*.ejs'], { cwd }).on(
    'all',
    debounce(async (_, changedPath) => {
      console.log(
        `\x1b[32m${changedPath}\x1b[0m changed, rebuilding templates...`,
      );

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
              output,
            },
            production,
          }),
        ),
      );
    }, 50),
  );

  chokidar.watch('src/styles/**/*.scss', { cwd }).on(
    'all',
    debounce((_, changedPath) => {
      console.log(
        `\x1b[32m${changedPath}\x1b[0m changed, rebuilding styles...`,
      );

      buildStyles(outputPath, { production });
    }, 50),
  );

  chokidar.watch(['src/typings.d.ts', 'src/scripts/**/*.ts'], { cwd }).on(
    'all',
    debounce((_, changedPath) => {
      console.log(
        `\x1b[32m${changedPath}\x1b[0m changed, rebuilding scripts...`,
      );

      buildScripts(outputPath, {
        production,
        stylesOutput: output.styles,
      });
    }, 50),
  );

  chokidar.watch('src/assets/**/*', { cwd }).on(
    'all',
    debounce((_, changedPath) => {
      console.log(`\x1b[32m${changedPath}\x1b[0m changed, copying assets...`);

      copyAssets([
        {
          from: 'src/assets/*',
          to: 'dist',
        },
      ]);
    }, 50),
  );

  chokidar
    .watch('dist/**/*', {
      cwd,
      ignored: ['**/sw.js*', '**/workbox*'],
    })
    .on(
      'all',
      debounce(() => {
        if (process.env.ENABLE_SERVICE_WORKER) {
          console.log('Rebuilding Service Worker...');

          generateServiceWorker(outputPath, { defaultLocale });
        }
      }, 950),
    );

  bs.init({
    server: {
      baseDir: 'dist',
      serveStaticOptions: { extensions: ['html'] },
      middleware: [
        (_, res, next) => {
          res.setHeader('service-worker-allowed', '/');
          next();
        },
      ],
    },
    open: false,
    notify: false,
  });

  chokidar.watch('dist/**/*.css', { cwd }).on(
    'all',
    debounce(() => bs.reload('*.css'), 50),
  );

  chokidar.watch('dist/**/*', { cwd, ignored: '**/*.css' }).on(
    'all',
    debounce(() => bs.reload(), 150),
  );
};

start();
