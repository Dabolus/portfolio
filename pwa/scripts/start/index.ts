import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { debounce } from 'lodash';
import browserSync from 'browser-sync';
import { buildTemplate } from '../build/templates';
import { buildScripts } from '../build/scripts';
import { buildStyles } from '../build/styles';
import { generateServiceWorkers } from '../build/sw';
import { copyAssets } from '../build/assets';
import { buildSitemap } from '../build/sitemap';
import { Data, LocaleDataModule, Locale } from '../build/models';

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

const start = async () => {
  const cwd = path.resolve(__dirname, '../..');
  const bs = browserSync.create();
  const defaultLocale = 'en';
  const localesData = await getLocalesData();
  const production = process.env.NODE_ENV === 'production';
  const defaultData = localesData.find(
    ({ locale }) => locale === defaultLocale,
  );

  chokidar.watch(['src/index.ejs', 'src/fragments/**/*.ejs'], { cwd }).on(
    'all',
    debounce((_, changedPath) => {
      console.log(
        `\x1b[32m${changedPath}\x1b[0m changed, rebuilding templates...`,
      );

      localesData.map((data) =>
        buildTemplate(path.resolve(outputPath, data.locale), {
          data,
          output: {
            scripts: {
              module: {
                main: 'module/main.js',
                home: 'module/pages/home.js',
                about: 'module/pages/about.js',
                certifications: 'module/pages/certifications.js',
                contacts: 'module/pages/contacts.js',
                projects: 'module/pages/projects.js',
                skills: 'module/pages/skills.js',
                utils: 'module/utils.js',
              },
              nomodule: {
                main: 'nomodule/main.js',
                home: 'nomodule/pages/home.js',
                about: 'nomodule/pages/about.js',
                certifications: 'nomodule/pages/certifications.js',
                contacts: 'nomodule/pages/contacts.js',
                projects: 'nomodule/pages/projects.js',
                skills: 'nomodule/pages/skills.js',
                utils: 'nomodule/utils.js',
              },
            },
            styles: { main: 'main.css' },
          },
          production,
        }),
      );
    }, 50),
  );

  chokidar.watch('src/styles/**/*.scss', { cwd }).on(
    'all',
    debounce((_, changedPath) => {
      console.log(
        `\x1b[32m${changedPath}\x1b[0m changed, rebuilding styles...`,
      );

      buildStyles(outputPath, { production, data: {} });
    }, 50),
  );

  chokidar.watch(['src/typings.d.ts', 'src/scripts/**/*.ts'], { cwd }).on(
    'all',
    debounce((_, changedPath) => {
      console.log(
        `\x1b[32m${changedPath}\x1b[0m changed, rebuilding scripts...`,
      );

      buildScripts(outputPath, { production, data: defaultData });
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
        if (process.env.ENABLE_DEV_SW) {
          console.log('Regenerating Service Worker...');

          generateServiceWorkers(outputPath, defaultLocale);
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