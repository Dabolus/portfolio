import { promises as fs } from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { debounce } from 'lodash-es';
import browserSync from 'browser-sync';
import { compileTemplate, buildTemplate } from '../build/templates.js';
import { buildScripts } from '../build/scripts.js';
import { buildStyles } from '../build/styles.js';
import { generateServiceWorker } from '../build/sw.js';
import { copyAssets } from '../build/assets.js';
import { Output } from '../build/models.js';
import { getConfig } from '../helpers/config.js';
import { getAvailableLocales, setupI18nHelpersMap } from '../helpers/i18n.js';
import { setupDatesHelpersMap } from '../helpers/dates.js';
import { generateStructuredData } from '../helpers/structuredData.js';
import { Data } from '../helpers/data/index.js';
import { getSkills, ParsedSkills } from '../helpers/data/skills.js';
import { getCertifications } from '../helpers/data/certifications.js';
import { getProjects } from '../helpers/data/projects.js';
import { getTimeline } from '../helpers/data/timeline.js';
import { computeDirname } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

const cachePath = path.resolve(__dirname, '../../node_modules/.cache/pwa');
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

const getSkillsWithCache = async (): Promise<ParsedSkills> => {
  // TODO: only cache GitHub data instead of all skills
  let skillsData: ParsedSkills | undefined = await fs
    .readFile(path.join(cachePath, 'skills.json'), 'utf8')
    .then((skills) => JSON.parse(skills))
    .catch(() => undefined);

  if (!skillsData) {
    console.log('No cached data, generating it');
    const skills = await getSkills();
    await fs.mkdir(cachePath, { recursive: true });
    await fs.writeFile(
      path.join(cachePath, 'skills.json'),
      JSON.stringify(skills),
    );
    skillsData = skills;
  } else {
    console.log('Using cached data');
  }

  return skillsData;
};

const getDataWithCache = async (): Promise<Data> => {
  const [certifications, projects, skills, timeline] = await Promise.all([
    getCertifications(),
    getProjects(),
    getSkillsWithCache(),
    getTimeline(),
  ]);

  return {
    certifications,
    projects,
    skills,
    timeline,
  };
};

const start = async () => {
  const cwd = path.resolve(__dirname, '../..');
  const bs = browserSync.create();

  const production = process.env.NODE_ENV === 'production';

  const availableLocales = await getAvailableLocales();

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
      debounce(async (_, changedPath) => {
        console.log(
          `\x1b[32m${changedPath}\x1b[0m changed, rebuilding templates...`,
        );

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

          generateServiceWorker(outputPath, availableLocales);
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
