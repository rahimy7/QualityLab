/**
 * Registro del service worker.
 *
 * Solo en producción: en desarrollo un worker cacheando el bundle de Vite
 * produce recargas confusas.
 */
export function registrarServiceWorker(): void {
  if (import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      // Sin service worker la aplicación sigue funcionando; solo se pierde el modo offline.
    });
  });
}
