const CACHE_VERSION = 'entrenador-miguel-v1.0.2-rc1-series-transition-fix';
const APP_CACHE = `${CACHE_VERSION}-app`;
const PRECACHE_URLS = [
  './',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/app-icon-maskable-512.png',
  './css/base.css',
  './css/components.css',
  './css/layout.css',
  './css/screens.css',
  './css/tokens.css',
  './index.html',
  './js/app.js',
  './js/components/app-header.js',
  './js/components/circular-timer.js',
  './js/components/exercise-illustration.js',
  './js/components/exercise-stats.js',
  './js/components/primary-button.js',
  './js/components/progress-bar.js',
  './js/components/session-card.js',
  './js/components/technique-panel.js',
  './js/core/feedback-service.js',
  './js/core/history-service.js',
  './js/core/plan-service.js',
  './js/core/session-engine.js',
  './js/core/timer-service.js',
  './js/data/exercise-library.js',
  './js/data/messages.js',
  './js/data/phase-library.js',
  './js/data/session-library.js',
  './js/illustrations/ankle.js',
  './js/illustrations/illustration-registry.js',
  './js/illustrations/session-a.js',
  './js/illustrations/session-b.js',
  './js/illustrations/session-c.js',
  './js/screens/completed-screen.js',
  './js/screens/exercise-screen.js',
  './js/screens/first-run-screen.js',
  './js/screens/history-screen.js',
  './js/screens/home-screen.js',
  './js/screens/medical-notice-screen.js',
  './js/screens/rest-screen.js',
  './js/screens/settings-screen.js',
  './js/state/persistence.js',
  './js/state/selectors.js',
  './js/state/store.js',
  './js/utils/date-utils.js',
  './js/utils/dom-utils.js',
  './js/utils/format-utils.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('entrenador-miguel-') && cacheName !== APP_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(APP_CACHE);
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      if (request.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) {
          return fallback;
        }
      }
      throw error;
    }
  })());
});
