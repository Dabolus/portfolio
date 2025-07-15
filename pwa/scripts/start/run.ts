import fs from 'node:fs';
import path from 'node:path';
import { debounce } from 'lodash-es';
import { buildTemplate } from '../build/templates.js';
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
  cachePath,
  computeDirname,
  logExecutionTime,
  resolveDependencyPath,
} from '../helpers/utils.js';
import { createServer } from './server.js';
import { watch } from './watcher.js';

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

const downloadROMsWithCache = async (to: string) => {
  let lastUpdate: Date | undefined;
  const resolvedCachePath = path.resolve(cachePath, to);
  try {
    const rawContent = await fs.promises.readFile(
      path.resolve(cachePath, 'metadata.json'),
      'utf-8',
    );
    const metadata = JSON.parse(rawContent);
    lastUpdate = new Date(metadata.lastUpdate);
  } catch {}
  // No cache or too old
  if (!lastUpdate || Date.now() - lastUpdate.valueOf() > 24 * 60 * 60 * 1000) {
    await fs.promises.mkdir(resolvedCachePath, { recursive: true });
    await downloadROMs(resolvedCachePath);
    await fs.promises.writeFile(
      path.resolve(resolvedCachePath, 'metadata.json'),
      JSON.stringify({ lastUpdate: new Date().toISOString() }),
    );
  }
  await fs.promises.mkdir(to, { recursive: true });
  const cacheDirContent = await fs.promises.readdir(resolvedCachePath, {
    withFileTypes: true,
  });
  await Promise.all(
    cacheDirContent
      .filter((file) => file.isFile() && file.name !== 'metadata.json')
      .map((file) =>
        fs.promises.copyFile(
          path.resolve(resolvedCachePath, file.name),
          path.resolve(to, file.name),
        ),
      ),
  );
};

const start = async () => {
  const buildDate = new Date();
  const cwd = path.resolve(__dirname, '../..');

  const production = process.env.NODE_ENV === 'production';

  const [availableLocales, portfolioDataAssetsPath] = await Promise.all([
    getAvailableLocales(),
    resolveDependencyPath('@dabolus/portfolio-data').then((packagePath) =>
      path.resolve(packagePath, 'assets'),
    ),
  ]);

  const buildDevTemplates = async () => {
    const [config, data, i18nHelpersMap, datesHelpersMap] = await Promise.all([
      getConfig(),
      getDataWithCache(),
      setupI18nHelpersMap(),
      setupDatesHelpersMap(),
    ]);
    await Promise.all(
      availableLocales.map((locale) =>
        buildTemplate(path.resolve(outputPath, locale), {
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
            buildDate,
            output,
          },
          production,
        }),
      ),
    );
  };
  const buildDevStyles = async () => {
    const data = await getDataWithCache();
    await buildStyles(outputPath, { production, data });
  };
  const buildDevScripts = async () => {
    await buildScripts(outputPath, {
      production,
      stylesOutput: output.styles,
    });
  };
  const copyDevAssets = async () => {
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
      downloadROMsWithCache('dist/cartridges/roms'),
    ]);
  };
  const generateDevServiceWorker = async () => {
    await generateServiceWorker(outputPath, { production, availableLocales });
  };

  watch(
    [
      'src/index.ejs',
      'src/fragments/**/*.ejs',
      'src/data/**/*.yml',
      'src/locales/**/*.po',
    ],
    { cwd, ignoreInitial: true },
    debounce(
      logExecutionTime<fs.WatchListener<string>>(
        buildDevTemplates,
        (_, changedPath) =>
          `\x1b[32m${changedPath}\x1b[0m changed, rebuilding \x1b[35mtemplates\x1b[0m...`,
        (time) => `\x1b[35mTemplates\x1b[0m rebuilt in \x1b[36m${time}\x1b[0m`,
      ),
      50,
    ),
  );

  watch(
    ['src/styles/**/*.scss', 'src/data/**/*.yml'],
    { cwd, ignoreInitial: true },
    debounce(
      logExecutionTime<fs.WatchListener<string>>(
        buildDevStyles,
        (_, changedPath) =>
          `\x1b[32m${changedPath}\x1b[0m changed, rebuilding \x1b[35mstyles\x1b[0m...`,
        (time) => `\x1b[35mStyles\x1b[0m rebuilt in \x1b[36m${time}\x1b[0m`,
      ),
      50,
    ),
  );

  watch(
    ['src/typings.d.ts', 'src/scripts/**/*.ts'],
    { cwd, ignoreInitial: true },
    debounce(
      logExecutionTime<fs.WatchListener<string>>(
        buildDevScripts,
        (_, changedPath) =>
          `\x1b[32m${changedPath}\x1b[0m changed, rebuilding \x1b[35mscripts\x1b[0m...`,
        (time) => `\x1b[35mScripts\x1b[0m rebuilt in \x1b[36m${time}\x1b[0m`,
      ),
      50,
    ),
  );

  watch(
    ['src/assets/**/*', `${portfolioDataAssetsPath}/**/*`],
    { cwd, ignoreInitial: true },
    debounce(
      logExecutionTime<fs.WatchListener<string>>(
        copyDevAssets,
        (_, changedPath) =>
          `\x1b[32m${changedPath}\x1b[0m changed, copying \x1b[35massets\x1b[0m...`,
        (time) => `\x1b[35mAssets\x1b[0m copied in \x1b[36m${time}\x1b[0m`,
      ),
      50,
    ),
  );

  if (process.env.ENABLE_SERVICE_WORKER) {
    watch(
      'dist/**/*',
      {
        cwd,
        ignoreInitial: true,
        ignored: ['**/sw.js*', '**/workbox*'],
      },
      debounce(
        logExecutionTime<fs.WatchListener<string>>(
          generateDevServiceWorker,
          'Regenerating \x1b[35mService Worker\x1b[0m...',
          (time) =>
            `\x1b[35mService Worker\x1b[0m regenerated in \x1b[36m${time}\x1b[0m`,
        ),
        950,
      ),
    );
  }

  await logExecutionTime(
    () =>
      Promise.all([
        buildDevTemplates(),
        buildDevStyles(),
        buildDevScripts(),
        copyDevAssets(),
        ...(process.env.ENABLE_SERVICE_WORKER
          ? [generateDevServiceWorker()]
          : []),
      ]),
    'Creating \x1b[35minitial build\x1b[0m...',
    (time) => `\x1b[35mInitial build\x1b[0m created in \x1b[36m${time}\x1b[0m`,
  )();

  await logExecutionTime(
    createServer,
    'Creating \x1b[35mHMR server\x1b[0m...',
    (time) => `\x1b[35mHMR server\x1b[0m created in \x1b[36m${time}\x1b[0m`,
  )({
    baseDir: outputPath,
    serveStaticOptions: {
      headers: {
        'service-worker-allowed': '/',
      },
    },
    reloadDebounce: 50,
  });
};

logExecutionTime(
  start,
  'Starting \x1b[35mdev server\x1b[0m...',
  (time) => `\x1b[35mDev server\x1b[0m started in \x1b[36m${time}\x1b[0m`,
)();
