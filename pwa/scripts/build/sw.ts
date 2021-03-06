import path from 'path';
import { injectManifest } from 'workbox-build';

export const generateServiceWorker = async (
  globDirectory: string,
  availableLocales: readonly string[],
) => {
  await injectManifest({
    swSrc: path.join(__dirname, '../../src/sw.js'),
    swDest: path.join(globDirectory, 'sw.js'),
    globDirectory,
    globPatterns: [
      './index.html',
      ...availableLocales.flatMap((locale) => [
        `./${locale}/index.html`,
        `./${locale}/fragments/**/*.html`,
      ]),
      './fonts/**/*.woff2',
      './images/**/*.{svg,jpg,webp}',
      './scripts/**/*.js',
      './styles/**/*.css',
    ],
  });
};
