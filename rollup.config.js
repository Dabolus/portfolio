import { resolve } from 'path';
import ejs from './plugins/ejs.plugin';
import workbox from './plugins/workbox.plugin';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/main.js',
    format: 'iife',
  },
  plugins: [
    babel({
      exclude: 'node_modules',
      extensions: ['.ts', '.js'],
    }),
    ejs({
      template: 'src/index.ejs',
      target: 'dist/index.html',
      compilerOptions: {
        client: false,
      },
      ...isProd ? {
        htmlMinifierOptions: {
          minifyCSS: {
            level: {
              2: {
                all: true,
              },
            },
          },
          minifyJS: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          removeOptionalTags: true,
          removeTagWhitespace: true,
          sortAttributes: true,
          sortClassName: true,
          removeRedundantAttributes: true,
        },
      } : {},
    }),
    ...isProd ? [
      terser(),
      workbox({
        mode: 'generateSW',
        options: {
          swDest: resolve('dist', 'sw.js'),
          globDirectory: 'dist',
        },
      }),
    ] : [],
  ],
};
