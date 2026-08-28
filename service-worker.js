const CACHE_NAME = 'frozen-rope-v1';
const CORE_ASSETS = [
  '/',
  '/styles.css',
  '/site.js',
  '/site.webmanifest',
  '/frsci-logo-header.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      const shouldCache = response.ok && (
        ['document', 'script', 'style', 'manifest'].includes(request.destination) ||
        url.pathname.startsWith('/icons/') ||
        url.pathname === '/frsci-logo-header.png'
      );

      if (shouldCache) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;

      if (request.mode === 'navigate') {
        const home = await caches.match('/');
        if (home) return home;
      }

      throw error;
    }
  })());
});
