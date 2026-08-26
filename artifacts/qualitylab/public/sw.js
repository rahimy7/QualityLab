/**
 * Service worker de QualityLab 360.
 *
 * Estrategia deliberadamente simple, porque el aula suele tener wifi malo:
 * - Navegaciones: red primero, con la copia en caché como respaldo.
 * - Recursos estáticos: caché primero, y se refresca en segundo plano.
 *
 * Todos los datos del módulo viven en el bundle y el avance en localStorage,
 * así que una vez cargada la app funciona completa sin conexión.
 */
const CACHE = 'qualitylab-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE).then((c) => c.put(request, copia));
          return respuesta;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('index.html'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((enCache) => {
      const red = fetch(request)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE).then((c) => c.put(request, copia));
          }
          return respuesta;
        })
        .catch(() => enCache);
      return enCache || red;
    }),
  );
});
