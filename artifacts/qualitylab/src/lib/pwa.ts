/**
 * Service worker y recuperación de versiones viejas.
 */

/**
 * ¿El fallo es de carga de un módulo y no de datos? Solo entonces conviene
 * recargar: si lo que está caído es la API, borrar la caché no arregla nada y
 * además deja al participante sin lo que tenía guardado para trabajar offline.
 */
export function esErrorDeModulo(err: unknown): boolean {
  const texto = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  return /dynamically imported module|module script failed|ChunkLoadError|MIME type/i.test(texto);
}

const CLAVE_RECARGA = 'qualitylab360.recargaPorVersion';
/** Dos recargas seguidas significan que recargar no es la solución. */
const ESPERA_ENTRE_INTENTOS_MS = 60_000;

/**
 * Borra todo lo que el navegador guardó de una versión anterior de la app y
 * recarga. Es la salida cuando un chunk del build viejo ya no existe en el
 * servidor: sin esto la pestaña se queda atascada hasta que alguien vacía la
 * caché a mano.
 *
 * Guarda el momento del intento y no una bandera que se limpie al cargar bien:
 * lo que carga bien es justamente lo que llega antes de que falle la pantalla,
 * así que limpiarla ahí convertía la recuperación en un bucle de recargas.
 * Pasado un minuto se permite otro intento, que ya sería un despliegue nuevo.
 *
 * Devuelve true si la recarga va en camino.
 */
export async function recuperarDeVersionVieja(): Promise<boolean> {
  try {
    const intentoPrevio = Number(window.sessionStorage.getItem(CLAVE_RECARGA) ?? 0);
    if (intentoPrevio && Date.now() - intentoPrevio < ESPERA_ENTRE_INTENTOS_MS) return false;
    window.sessionStorage.setItem(CLAVE_RECARGA, String(Date.now()));
  } catch {
    // Sin sessionStorage no hay forma de evitar el bucle: mejor no recargar.
    return false;
  }
  try {
    if ('caches' in window) {
      await Promise.all((await caches.keys()).map((c) => caches.delete(c)));
    }
    if ('serviceWorker' in navigator) {
      const registros = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registros.map((r) => r.unregister()));
    }
  } catch {
    // Da igual por qué falló la limpieza: recargar sigue siendo lo mejor.
  }
  window.location.reload();
  return true;
}

/**
 * Registro del service worker.
 *
 * Solo en producción: en desarrollo un worker cacheando el bundle de Vite
 * produce recargas confusas.
 */
export function registrarServiceWorker(): void {
  if (import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;

  const registrar = () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      // Sin service worker la aplicación sigue funcionando; solo se pierde el modo offline.
    });
  };

  // El arranque espera a que la API entregue los casos, así que para cuando se
  // llama aquí el evento 'load' ya pasó: suscribirse a él dejaría la app sin
  // service worker y sin modo offline, en silencio.
  if (document.readyState === 'complete') registrar();
  else window.addEventListener('load', registrar, { once: true });
}
