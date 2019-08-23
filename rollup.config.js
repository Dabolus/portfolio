import { resolve as resolvePath } from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import ejs from './plugins/ejs.plugin';
import sass from './plugins/sass.plugin';
import workbox from './plugins/workbox.plugin';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import { minify } from 'terser';

const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'src/scripts/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'iife',
  },
  plugins: [
    copy({
      targets: [
        {
          src: 'src/assets/*',
          dest: 'dist',
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
              collapseInlineTagWhitespace: true,
              removeOptionalTags: true,
              removeTagWhitespace: true,
              sortAttributes: true,
              sortClassName: true,
              removeRedundantAttributes: true,
            },
          }
        : {}),
    }),
    sass({
      entrypoint: 'src/styles/main.scss',
      target: 'dist/styles.css',
    }),
    ...(isProd
      ? [
          terser(),
          workbox({
            mode: 'generateSW',
            options: {
              cacheId: 'gg',
              swDest: resolvePath('dist', 'sw.js'),
              globDirectory: 'dist',
              globPatterns: [
                '**/*.{css,woff2}',
                '**/main.js',
                '**/google-g.svg',
                '**/propic.jpg',
              ],
              templatedURLs: {
                '/': 'functions/index.hbs',
              },
              navigateFallback: '/',
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
              ],
              offlineGoogleAnalytics: true,
            },
          }),
        ]
      : []),
  ],
};
