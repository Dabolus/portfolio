import path from 'path';
import { generateSW } from 'workbox-build';

const generateServiceWorker = async (
  outputPath: string,
  { modules, defaultLocale }: { modules: boolean; defaultLocale: string },
) => {
  const globDirectory = path.join(outputPath, modules ? 'module' : 'nomodule');

  await generateSW({
    cacheId: 'gg',
    skipWaiting: true,
    clientsClaim: true,
    swDest: path.join(globDirectory, 'sw.js'),
    globDirectory,
    globPatterns: [
      `../${defaultLocale}/index.html`,
      '../styles.css',
      '../fonts/*.woff2',
      '../images/*.{svg,jpg,webp}',
      './**/*.js',
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

export async function generateServiceWorkers(
  outputPath: string,
  defaultLocale: string,
): Promise<void> {
  await Promise.all([
    generateServiceWorker(outputPath, { modules: true, defaultLocale }),
    generateServiceWorker(outputPath, { modules: false, defaultLocale }),
  ]);
}
