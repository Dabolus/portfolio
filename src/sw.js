/* global workbox */

workbox.skipWaiting();
workbox.clientsClaim();
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest);
workbox.routing.registerNavigationRoute('/index.html');
// workbox.routing.registerRoute(/scripts\/[0-9]+\.js/, workbox.strategies.staleWhileRevalidate(), 'GET');
