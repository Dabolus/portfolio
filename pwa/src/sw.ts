import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { initialize as gaInitialize } from 'workbox-google-analytics';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
  switch (event.data.action) {
    case 'update':
      // Skip the waiting phase and immediately replace the old Service Worker
      self.skipWaiting();
      break;
  }
});

setCacheNameDetails({ prefix: 'gg' });
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(
  /api/,
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new BackgroundSyncPlugin('api-sync-queue', {
        maxRetentionTime: 3600,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET',
);
registerRoute(
  /firebasestorage\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'dynamic-assets-cache',
    plugins: [
      new BackgroundSyncPlugin('dynamic-assets-sync-queue', {
        maxRetentionTime: 3600,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET',
);

gaInitialize({
  hitFilter: (params) => params.set('ep.offline', 'true'),
});
