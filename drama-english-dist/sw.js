// Drama English — minimal offline-friendly Service Worker
const CACHE = 'drama-english-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(event.request).then((cached) => {
        const fetched = fetch(event.request)
          .then((resp) => {
            if (resp && resp.status === 200 && resp.type === 'basic') {
              cache.put(event.request, resp.clone());
            }
            return resp;
          })
          .catch(() => cached);
        return cached || fetched;
      })
    )
  );
});
