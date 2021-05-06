importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.1.1/workbox-sw.js',
);

self.addEventListener('message', (event) => {
  switch (event.data.action) {
    case 'update':
      // Skip the waiting phase and immediately replace the old Service Worker
      self.skipWaiting();
      break;
  }
});

workbox.core.setCacheNameDetails({
  prefix: 'gg',
});
workbox.core.clientsClaim();
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
workbox.routing.registerRoute(
  new workbox.routing.NavigationRoute(
    workbox.precaching.createHandlerBoundToURL('/index.html'),
    {
      denylist: [/api/],
    },
  ),
);
workbox.routing.registerRoute(
  /api/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin('api-sync-queue', {
        maxRetentionTime: 3600,
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET',
);
workbox.routing.registerRoute(
  /firebasestorage\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'dynamic-assets-cache',
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin(
        'dynamic-assets-sync-queue',
        {
          maxRetentionTime: 3600,
        },
      ),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET',
);

workbox.googleAnalytics.initialize({
  hitFilter: (params) => params.set('ep.offline', 'true'),
});
