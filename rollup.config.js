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
      data: { isProd },
      ...(isProd
        ? {
            htmlMinifierOptions: {
              minifyCSS: {
                level: {
                  2: {
                    all: true,
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
                '../**/*.{css,woff2}',
                `../**/${main ? 'module' : 'nomodule'}/**/*.js`,
                '../**/google-g.svg',
                '../**/propic.jpg',
                '../**/propic.webp',
              ],
              templatedURLs: {
                '/': 'functions/index.hbs',
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
