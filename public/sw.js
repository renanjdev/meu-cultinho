/**
 * Service worker mínimo do Meu Cultinho.
 * Estratégia network-first com fallback de cache: online sempre busca o dado
 * fresco; offline, serve a última versão em cache (e o app-shell "/" para
 * navegações). Existe sobretudo para tornar o app instalável (PWA standalone).
 */
const CACHE = 'cultinho-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
  );
});
