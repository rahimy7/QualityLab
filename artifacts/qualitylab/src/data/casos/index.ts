/**
 * Bootstrap de casos: FULL DB.
 *
 * Al cargar la app, GET /api/casos hidrata la lista y deja `casoActivo`
 * resuelto según `localStorage.casoActivoId`. El top-level await hace que
 * todos los módulos que dependen de este (shims `data/*.ts` y demás) esperen
 * a que la API responda antes de exponer sus constantes.
 */
import type { Caso } from './tipos';

const CLAVE_CASO_ACTIVO = 'qualitylab360.casoActivoId';

async function fetchCasos(): Promise<Caso[]> {
  const r = await fetch('/api/casos');
  if (!r.ok) throw new Error(`API /casos respondió ${r.status}`);
  const datos = (await r.json()) as Caso[];
  if (!Array.isArray(datos) || datos.length === 0) {
    throw new Error('La API no devolvió casos activos');
  }
  return datos;
}

function resolverActivo(lista: Caso[]): string {
  if (typeof window === 'undefined') return lista[0].id;
  try {
    const guardado = window.localStorage.getItem(CLAVE_CASO_ACTIVO);
    if (guardado && lista.some((c) => c.id === guardado)) return guardado;
  } catch {
    // localStorage no disponible.
  }
  return lista[0].id;
}

const casosLista: Caso[] = await fetchCasos();
const casos: Record<string, Caso> = Object.fromEntries(casosLista.map((c) => [c.id, c]));
const casoActivoId: string = resolverActivo(casosLista);
const casoActivo: Caso = casos[casoActivoId];

export { casos, casosLista, casoActivoId, casoActivo, CLAVE_CASO_ACTIVO };

export function cambiarCaso(id: string): void {
  if (!casos[id]) return;
  try {
    window.localStorage.setItem(CLAVE_CASO_ACTIVO, id);
  } catch {
    return;
  }
  window.location.reload();
}

export type { Caso } from './tipos';
