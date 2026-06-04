const CACHE_NAME = 'ur-mayorista-v1';
const urlsToCache = [
  '/',
  '/mayorista.html',
  '/manifest.json',
  '/img/logo-ur.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
