import ejs from './plugins/ejs.plugin';
import workbox from 'rollup-plugin-workbox-build';

const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/main.js',
    format: 'iife',
  },
  plugins: [
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
      workbox({
        mode: 'generateSW',
        options: {
          swDest: 'dist/sw.js',
          globDirectory: 'dist',
        },
      }),
    ] : [],
  ],
};
