/* global workbox */

workbox.skipWaiting();
workbox.clientsClaim();
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest);
workbox.routing.registerNavigationRoute('/');
// workbox.routing.registerRoute(/scripts\/[0-9]+\.js/, workbox.strategies.staleWhileRevalidate(), 'GET');
