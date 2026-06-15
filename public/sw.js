/**
 * Service worker do Meu Cultinho (modo "prompt").
 * Estratégia network-first com fallback de cache. NÃO ativa sozinho (sem
 * skipWaiting no install): a nova versão fica em "waiting" até o usuário tocar
 * "Atualizar" no banner (ver public/sw-register.js), que envia SKIP_WAITING.
 */
const CACHE = 'cultinho-v2';

self.addEventListener('install', (event) => {
  // sem skipWaiting: a nova versão aguarda a confirmação do usuário.
  // precache da casca '/' p/ o fallback offline ter conteúdo já no 1º acesso.
  event.waitUntil(caches.open(CACHE).then((c) => c.add('/').catch(() => {})));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

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
  // Só o app (mesma origem) é cacheado. A API do Supabase (cross-origin) passa
  // direto: sempre fresca, e nunca cacheada por URL (evita dado velho e
  // vazamento de leitura entre auxiliares após troca de login).
  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((res) => {
        // só cacheia resposta boa: evita gravar 404/5xx e servi-los offline
        if (res && res.ok && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
  );
});
