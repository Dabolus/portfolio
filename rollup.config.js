import { resolve as resolvePath } from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import ejs from './plugins/ejs.plugin';
import sass from './plugins/sass.plugin';
import workbox from './plugins/workbox.plugin';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import replace from 'rollup-plugin-replace';
import { minify } from 'terser';

const isProd = process.env.NODE_ENV === 'production';

const config = (main = true) => ({
  input: {
    main: 'src/scripts/main.ts',
    'pages/home': 'src/scripts/pages/home.ts',
    'pages/about': 'src/scripts/pages/about.ts',
    'pages/certifications': 'src/scripts/pages/certifications.ts',
    'pages/contacts': 'src/scripts/pages/contacts.ts',
    'pages/projects': 'src/scripts/pages/projects.ts',
    'pages/skills': 'src/scripts/pages/skills.ts',
  },
  output: main
    ? {
        dir: 'dist/module',
        format: 'esm',
        chunkFileNames: '[name].js',
      }
    : {
        dir: 'dist/nomodule',
        format: 'system',
        chunkFileNames: '[name].js',
      },
  plugins: [
    copy({
      targets: main
        ? [
            {
              src: 'src/assets/*',
              dest: 'dist',
            },
          ]
        : [
            {
              src: `node_modules/systemjs/dist/s${isProd ? '.min' : ''}.js`,
              dest: 'dist/nomodule',
            },
          ],
    }),
    resolve({
      extensions: ['.ts', '.js', '.mjs', '.scss', '.ejs'],
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.ts', '.js', '.mjs'],
      runtimeHelpers: true,
    }),
    replace({
      exclude: 'node_modules/**',
      delimiters: ['', ''],
      'process.env.ENABLE_DEV_SW': !!(isProd || process.env.ENABLE_DEV_SW),
      '{{jsDir}}': main ? 'module' : 'nomodule',
    }),
    ejs({
      template: 'src/index.ejs',
      target: 'functions/index.hbs',
      compilerOptions: {
        client: false,
      },
      data: {
        isProd,
        pages: [
          {
            id: 'about',
            title: 'About me',
            icon:
              'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z',
          },
          {
            id: 'projects',
            title: 'Projects',
            icon:
              'M22,9V7H20V5A2,2 0 0,0 18,3H4A2,2 0 0,0 2,5V19A2,2 0 0,0 4,21H18A2,2 0 0,0 20,19V17H22V15H20V13H22V11H20V9H22M18,19H4V5H18V19M6,13H11V17H6V13M12,7H16V10H12V7M6,7H11V12H6V7M12,11H16V17H12V11Z',
          },
          {
            id: 'certifications',
            title: 'Certifications',
            icon:
              'M4,3C2.89,3 2,3.89 2,5V15A2,2 0 0,0 4,17H12V22L15,19L18,22V17H20A2,2 0 0,0 22,15V8L22,6V5A2,2 0 0,0 20,3H16V3H4M12,5L15,7L18,5V8.5L21,10L18,11.5V15L15,13L12,15V11.5L9,10L12,8.5V5M4,5H9V7H4V5M4,9H7V11H4V9M4,13H9V15H4V13Z',
          },
          {
            id: 'contacts',
            title: 'Contacts',
            icon:
              'M9,11.75A1.25,1.25 0 0,0 7.75,13A1.25,1.25 0 0,0 9,14.25A1.25,1.25 0 0,0 10.25,13A1.25,1.25 0 0,0 9,11.75M15,11.75A1.25,1.25 0 0,0 13.75,13A1.25,1.25 0 0,0 15,14.25A1.25,1.25 0 0,0 16.25,13A1.25,1.25 0 0,0 15,11.75M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,11.71 4,11.42 4.05,11.14C6.41,10.09 8.28,8.16 9.26,5.77C11.07,8.33 14.05,10 17.42,10C18.2,10 18.95,9.91 19.67,9.74C19.88,10.45 20,11.21 20,12C20,16.41 16.41,20 12,20Z',
          },
          {
            id: 'skills',
            title: 'Skills',
            icon:
              'M21.3 13c.1 1.5-.6 3-1.9 3.9l.8 1.5c.2.4.3 1 0 1.4-.1.5-.5.8-1 1l-.8.3H18c-.5 0-1-.2-1.3-.6L14.4 18c-.8-.1-1.7-.5-2.4-1.1-.5.2-1 .2-1.5.2-.9 0-1.8-.2-2.5-.8-.5.2-1 .3-1.6.3-.8 0-1.6-.2-2.3-.5-1.4-.6-2.4-2-2.4-3.6-.1-.7 0-1.4.3-2.1-.3-.8-.3-1.6 0-2.3.3-1 1-1.8 1.9-2.3a4 4 0 0 1 4-2.7c1.6-1.5 4-1.6 5.8-.4l1.3-.1c1.4 0 2.6.5 3.5 1.6 2 .5 3.5 2.4 3.6 4.5 0 1.1-.3 2.2-.9 3.1l.1 1.1m-5-1.4c.6 0 1 .5 1 1a1 1 0 0 1-1 1h-.6c-.3 1-.9 1.8-1.6 2.4l.8.2c5.1-.1 4.5-3.2 4.5-3.3 0-1.4-1.3-2.5-2.7-2.5a1 1 0 0 1-1-1 1 1 0 0 1 1-1c1.2 0 2.4.5 3.3 1.3l.1-.9c0-1.2-.6-2.3-2.9-2.5C16 3.2 13 5 13 5.8l.2.8a1 1 0 0 1 1 1c0 .5-.4 1-1 1-.5 0-1-.3-1.4-.6-.5.3-1 .5-1.6.6a1 1 0 0 1-1.1-1c0-.5.3-1 .9-1 .1 0 1-.2 1-.8 0-.7.2-1.3.6-1.8-1-.3-2 0-3 1.3-1.8-.3-2.5 0-3 1.9C4.5 7.7 4 8 3.8 9c1-.2 2.2-.1 3.2.3.5.1.8.7.6 1.2a1 1 0 0 1-1.3.6 3 3 0 0 0-2.3 0c-.3.2-.3.8-.3 1.2 0 .8.3 1.5 1 1.9.5.2 1.1.4 1.7.4a6 6 0 0 1-.4-.8 1 1 0 0 1 2-.7c.4 1.1 1.4 1.9 2.6 2 1.3 0 2.6-.8 3.2-2.1.2-1.4 1.3-1.5 2.5-1.5m2 7.5l-.6-1.3-.7.1 1 1.3.3-.1m-4.6-8.6c0-.6-.4-1-1-1-.6-.1-1.3.1-1.9.6a3 3 0 0 0-.8 2.2 1 1 0 0 0 1 1c.6 0 1-.5 1-1 0-.3 0-.5.2-.8l.5-.1c.5 0 1-.4 1-1z',
          },
          {
            id: 'blog',
            title: 'Blog',
            icon:
              'M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z',
            link: 'https://giorgio.garasto.blog',
          },
        ],
      },
      ...(isProd
        ? {
            htmlMinifierOptions: {
              minifyCSS: {
                level: {
                  2: {
                    all: true,
                    removeUnusedAtRules: false,
                  },
                },
              },
              minifyJS: input => minify(input).code,
              collapseWhitespace: true,
              collapseBooleanAttributes: true,
              removeOptionalTags: true,
              removeTagWhitespace: true,
              sortAttributes: true,
              sortClassName: true,
              removeRedundantAttributes: true,
            },
          }
        : {}),
    }),
    ...(main
      ? [
          sass({
            entrypoint: 'src/styles/main.scss',
            target: 'dist/styles.css',
          }),
        ]
      : []),
    ...(isProd ? [terser()] : []),
    ...(isProd || process.env.ENABLE_DEV_SW
      ? [
          workbox({
            mode: 'generateSW',
            options: {
              cacheId: 'gg',
              skipWaiting: true,
              clientsClaim: true,
              swDest: resolvePath(
                'dist',
                main ? 'module' : 'nomodule',
                'sw.js',
              ),
              globDirectory: `dist/${main ? 'module' : 'nomodule'}`,
              globPatterns: [
                '../styles.css',
                '../fonts/*.woff2',
                '../images/*.{svg,jpg,webp}',
                `../${main ? 'module' : 'nomodule'}/**/*.js`,
              ],
              templatedURLs: {
                '/': ['../../functions/index.hbs'],
              },
              navigateFallback: '/',
              navigateFallbackBlacklist: [/api/],
              runtimeCaching: [
                {
                  method: 'GET',
                  urlPattern: /api/,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    backgroundSync: {
                      name: 'api-sync-queue',
                      options: {
                        maxRetentionTime: 3600,
                      },
                    },
                    cacheableResponse: {
                      statuses: [0, 200],
                    },
                    cacheName: 'api-cache',
                  },
                },
                {
                  method: 'GET',
                  urlPattern: /firebasestorage\.googleapis\.com/,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    backgroundSync: {
                      name: 'dynamic-assets-sync-queue',
                      options: {
                        maxRetentionTime: 3600,
                      },
                    },
                    cacheableResponse: {
                      statuses: [0, 200],
                    },
                    cacheName: 'dynamic-assets-cache',
                  },
                },
              ],
              offlineGoogleAnalytics: true,
            },
          }),
        ]
      : []),
  ],
});

export default [config(true), config(false)];
