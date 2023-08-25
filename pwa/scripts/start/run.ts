import path from 'node:path';
import chokidar from 'chokidar';
import { debounce } from 'lodash-es';
import browserSync from 'browser-sync';
import { compileTemplate, buildTemplate } from '../build/templates.js';
import { buildScripts } from '../build/scripts.js';
import { buildStyles } from '../build/styles.js';
import { generateServiceWorker } from '../build/sw.js';
import { copyAssets, downloadROMs } from '../build/assets.js';
import { Output } from '../build/models.js';
import { getConfig } from '../helpers/config.js';
import { getAvailableLocales, setupI18nHelpersMap } from '../helpers/i18n.js';
import { setupDatesHelpersMap } from '../helpers/dates.js';
import { generateStructuredData } from '../helpers/structuredData.js';
import { Data } from '../helpers/data/index.js';
import { getSkills } from '../helpers/data/skills.js';
import { getCertifications } from '../helpers/data/certifications.js';
import { getProjects } from '../helpers/data/projects.js';
import { getTimeline } from '../helpers/data/timeline.js';
import { getSocials } from '../helpers/data/socials.js';
import { getTimeMachineTravels } from '../helpers/data/timeMachine.js';
import {
  computeDirname,
  logExecutionTime,
  resolveDependencyPath,
} from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

const outputPath = path.resolve(__dirname, '../../dist');

// Not having the hashes in dev mode allows us to know in advance the output file names.
// This allows us to build some things in parallel.
const output: Output = {
  // NOTE: we don't care about preloading imports in dev mode, so we just set them to an empty array
  scripts: {
    main: {
      fileName: 'scripts/main.js',
      dependencies: [],
    },
    home: {
      fileName: 'scripts/pages/home.js',
      dependencies: [],
    },
    about: {
      fileName: 'scripts/pages/about.js',
      dependencies: [],
    },
    certifications: {
      fileName: 'scripts/pages/certifications.js',
      dependencies: [],
    },
    contacts: {
      fileName: 'scripts/pages/contacts.js',
      dependencies: [],
    },
    projects: {
      fileName: 'scripts/pages/projects.js',
      dependencies: [],
    },
    skills: {
      fileName: 'scripts/pages/skills.js',
      dependencies: [],
    },
  },
  styles: {
    main: {
      fileName: 'styles/main.css',
    },
    home: {
      fileName: 'styles/home.css',
    },
    about: {
      fileName: 'styles/pages/about.css',
    },
    certifications: {
      fileName: 'styles/pages/certifications.css',
    },
    contacts: {
      fileName: 'styles/pages/contacts.css',
    },
    projects: {
      fileName: 'styles/pages/projects.css',
    },
    skills: {
      fileName: 'styles/pages/skills.css',
    },
  },
};

const getDataWithCache = async (): Promise<Data> => {
  const [
    certifications,
    projects,
    skills,
    timeline,
    socials,
    timeMachineTravels,
  ] = await Promise.all([
    getCertifications(),
    getProjects(),
    getSkills({ cache: true }),
    getTimeline(),
    getSocials(),
    getTimeMachineTravels(),
  ]);

  return {
    certifications,
    projects,
    skills,
    timeline,
    socials,
    timeMachineTravels,
  };
};

const start = async () => {
  const cwd = path.resolve(__dirname, '../..');
  const bs = browserSync.create();

  const production = process.env.NODE_ENV === 'production';

  const [availableLocales, portfolioDataAssetsPath] = await Promise.all([
    getAvailableLocales(),
    resolveDependencyPath('@dabolus/portfolio-data/assets'),
  ]);

  chokidar
    .watch(
      [
        'src/index.ejs',
        'src/fragments/**/*.ejs',
        'src/data/**/*.yml',
        'src/locales/**/*.po',
      ],
      {
        cwd,
      },
    )
    .on(
      'all',
      debounce(
        logExecutionTime(
          async (_, changedPath) => {
            const [config, data, i18nHelpersMap, datesHelpersMap] =
              await Promise.all([
                getConfig(),
                getDataWithCache(),
                setupI18nHelpersMap(),
                setupDatesHelpersMap(),
              ]);

            await Promise.all([
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
                  output,
                },
                production,
              }),
              ...availableLocales.map((locale) =>
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
                      generateStructuredData,
                    },
                    output,
                  },
                  production,
                }),
              ),
            ]);
          },
          (_, changedPath) =>
            `\x1b[32m${changedPath}\x1b[0m changed, rebuilding \x1b[35mtemplates\x1b[0m...`,
          (time) =>
            `\x1b[35mTemplates\x1b[0m rebuilt in \x1b[36m${time}\x1b[0m`,
        ),
        50,
      ),
    );

  chokidar.watch(['src/styles/**/*.scss', 'src/data/**/*.yml'], { cwd }).on(
    'all',
    debounce(
      logExecutionTime(
        async (_, changedPath) => {
          const data = await getDataWithCache();

          await buildStyles(outputPath, { production, data });
        },
        (_, changedPath) =>
          `\x1b[32m${changedPath}\x1b[0m changed, rebuilding \x1b[35mstyles\x1b[0m...`,
        (time) => `\x1b[35mStyles\x1b[0m rebuilt in \x1b[36m${time}\x1b[0m`,
      ),
      50,
    ),
  );

  chokidar.watch(['src/typings.d.ts', 'src/scripts/**/*.ts'], { cwd }).on(
    'all',
    debounce(
      logExecutionTime(
        async (_, changedPath) => {
          await buildScripts(outputPath, {
            production,
            stylesOutput: output.styles,
          });
        },
        (_, changedPath) =>
          `\x1b[32m${changedPath}\x1b[0m changed, rebuilding \x1b[35mscripts\x1b[0m...`,
        (time) => `\x1b[35mScripts\x1b[0m rebuilt in \x1b[36m${time}\x1b[0m`,
      ),
      50,
    ),
  );

  chokidar
    .watch(['src/assets/**/*', `${portfolioDataAssetsPath}/**/*`], { cwd })
    .on(
      'all',
      debounce(
        logExecutionTime(
          async (_, changedPath) => {
            await Promise.all([
              copyAssets([
                {
                  from: 'src/assets/*',
                  to: 'dist',
                },
                {
                  from: `${portfolioDataAssetsPath}/*`,
                  to: 'dist',
                },
              ]),
              downloadROMs('dist/cartridges/roms'),
            ]);
          },
          (_, changedPath) =>
            `\x1b[32m${changedPath}\x1b[0m changed, copying \x1b[35massets\x1b[0m...`,
          (time) => `\x1b[35mAssets\x1b[0m copied in \x1b[36m${time}\x1b[0m`,
        ),
        50,
      ),
    );

  if (process.env.ENABLE_SERVICE_WORKER) {
    chokidar
      .watch('dist/**/*', {
        cwd,
        ignored: ['**/sw.js*', '**/workbox*'],
      })
      .on(
        'all',
        debounce(
          logExecutionTime(
            async () => {
              await generateServiceWorker(outputPath, availableLocales);
            },
            'Regenerating \x1b[35mService Worker\x1b[0m...',
            (time) =>
              `\x1b[35mService Worker\x1b[0m regenerated in \x1b[36m${time}\x1b[0m`,
          ),
          950,
        ),
      );
  }

  bs.init({
    server: {
      baseDir: path.resolve(cwd, 'dist'),
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

logExecutionTime(
  start,
  'Starting \x1b[35mdev server\x1b[0m...',
  (time) => `\x1b[35mDev server\x1b[0m started in \x1b[36m${time}\x1b[0m`,
)();
