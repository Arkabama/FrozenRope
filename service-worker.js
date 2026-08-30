const CACHE_NAME = 'frozen-rope-v6';
const CORE_ASSETS = [
  '/',
  '/404.html',
  '/styles.css?v=20260828d',
  '/site.js?v=20260830a',
  '/site.webmanifest?v=20260828a',
  '/frsci-logo-header.png',
  '/assets/web/frozenrope-primary.webp?v=20260828b',
  '/assets/web/fr-mark.webp',
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

  const fetchAndCache = async () => {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  };

  const isStaticAsset = ['image', 'script', 'style', 'manifest'].includes(request.destination) ||
    url.pathname.startsWith('/assets/web/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/frsci-logo-header.png';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetchAndCache())
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetchAndCache().catch(async () =>
        (await caches.match(request)) ||
        (await caches.match('/404.html')) ||
        caches.match('/')
      )
    );
  }
});
