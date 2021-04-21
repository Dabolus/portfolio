import path from 'path';
import { injectManifest } from 'workbox-build';

export const generateServiceWorker = async (
  globDirectory: string,
  { defaultLocale }: { defaultLocale: string },
) => {
  await injectManifest({
    swSrc: path.join(__dirname, '../../src/sw.js'),
    swDest: path.join(globDirectory, 'sw.js'),
    globDirectory,
    globPatterns: [
      `./${defaultLocale}/index.html`,
      `./${defaultLocale}/fragments/**/*.html`,
      './fonts/**/*.woff2',
      './images/**/*.{svg,jpg,webp}',
      './scripts/**/*.js',
      './styles/**/*.css',
    ],
  });
};
