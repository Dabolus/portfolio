import path from 'path';
import { generateSW } from 'workbox-build';

export const generateServiceWorker = async (
  globDirectory: string,
  { defaultLocale }: { defaultLocale: string },
) => {
  await generateSW({
    cacheId: 'gg',
    skipWaiting: true,
    clientsClaim: true,
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
    navigateFallback: `/${defaultLocale}/index.html`,
    navigateFallbackDenylist: [/api/],
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
  });
};
