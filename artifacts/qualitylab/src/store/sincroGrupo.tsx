/**
 * Sincronización individual con etiqueta de grupo.
 *
 * Cada participante trabaja su propia copia; el grupo es una etiqueta que
 * permite al facilitador revisar el trabajo agrupado por equipo. Al activar
 * el modo grupo, cada cambio de estado se envía (debounced) a la API para
 * que quede persistido en `grupos_avances`.
 *
 * Va como provider montado en la raíz y no como hook suelto: el participante
 * pasa la clase dentro de los laboratorios, no en Inicio, y si la
 * sincronización viviera en el panel de Inicio dejaría de guardar en cuanto
 * navegara a otra pantalla.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { casoActivoId } from '@/data/casos';
import { idDispositivo } from '@/lib/dispositivo';
import { useProgreso } from './progreso';

const CLAVE_ACTIVO = 'qualitylab360.sincroGrupo.activo';
const DEBOUNCE_MS = 2500;
/**
 * `keepalive` deja que la petición termine aunque la pestaña se cierre, pero
 * los navegadores lo limitan a 64 KB de cuerpo. Por debajo de ese margen lo
 * usamos; por encima se intenta un envío normal, que puede quedar a medias.
 */
const LIMITE_KEEPALIVE = 60_000;

export type EstadoSincro = 'apagado' | 'pendiente' | 'guardando' | 'ok' | 'error';

interface Contexto {
  activo: boolean;
  setActivo: (v: boolean) => void;
  sincro: EstadoSincro;
  ultimo: string | null;
  error: string | null;
  /** Envía de inmediato, sin esperar el debounce. */
  forzar: () => Promise<void>;
}

function leerBool(clave: string, def: boolean): boolean {
  if (typeof window === 'undefined') return def;
  try {
    const v = window.localStorage.getItem(clave);
    if (v === null) return def;
    return v === '1' || v === 'true';
  } catch {
    return def;
  }
}

function guardarBool(clave: string, valor: boolean): void {
  try {
    window.localStorage.setItem(clave, valor ? '1' : '0');
  } catch {
    // Sin storage: la elección dura lo que la pestaña.
  }
}

const SincroGrupoContext = createContext<Contexto | null>(null);

export function SincroGrupoProvider({ children }: { children: ReactNode }) {
  const { estado } = useProgreso();
  const [activo, setActivoState] = useState<boolean>(() => leerBool(CLAVE_ACTIVO, false));
  const [sincro, setSincro] = useState<EstadoSincro>(() => (leerBool(CLAVE_ACTIVO, false) ? 'ok' : 'apagado'));
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const temporizador = useRef<number | null>(null);
  /** Hay cambios que todavía no llegaron al servidor. */
  const pendiente = useRef(false);

  const setActivo = useCallback((v: boolean) => {
    setActivoState(v);
    guardarBool(CLAVE_ACTIVO, v);
    if (!v) {
      setSincro('apagado');
      setError(null);
    } else {
      setSincro('pendiente');
    }
  }, []);

  const enviar = useCallback(
    async (alCerrar = false) => {
      const grupoId = estado.perfil.equipoId?.trim();
      if (!activo || !grupoId) return;
      const cuerpo = JSON.stringify({
        casoId: casoActivoId,
        dispositivoId: idDispositivo(),
        nombre: estado.perfil.nombre ?? '',
        contenido: estado,
      });
      setSincro('guardando');
      setError(null);
      try {
        const r = await fetch(`/api/grupos/${encodeURIComponent(grupoId)}/avance`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: cuerpo,
          keepalive: alCerrar && cuerpo.length < LIMITE_KEEPALIVE,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { actualizadoEn: string };
        pendiente.current = false;
        setSincro('ok');
        setUltimo(data.actualizadoEn);
      } catch (err) {
        setSincro('error');
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [activo, estado],
  );

  // El listener de cierre se registra una sola vez, así que necesita una
  // referencia al envío más reciente y no al que existía cuando se montó.
  const enviarRef = useRef(enviar);
  useEffect(() => {
    enviarRef.current = enviar;
  }, [enviar]);

  useEffect(() => {
    if (!activo) return;
    if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    setSincro((s) => (s === 'error' ? s : 'pendiente'));
    pendiente.current = true;
    temporizador.current = window.setTimeout(() => {
      void enviar();
    }, DEBOUNCE_MS);
    return () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    };
  }, [activo, enviar]);

  /**
   * El debounce deja una ventana en la que el último cambio aún no viajó. Si el
   * participante cierra la pestaña o cambia de app —lo normal al terminar la
   * clase, y más en el celular— se envía de inmediato en vez de perderlo.
   */
  useEffect(() => {
    if (!activo) return;
    const vaciar = () => {
      if (!pendiente.current) return;
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
        temporizador.current = null;
      }
      void enviarRef.current(true);
    };
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'hidden') vaciar();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('pagehide', vaciar);
    return () => {
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('pagehide', vaciar);
    };
  }, [activo]);

  const valor = useMemo(
    () => ({ activo, setActivo, sincro, ultimo, error, forzar: enviar }),
    [activo, setActivo, sincro, ultimo, error, enviar],
  );

  return <SincroGrupoContext.Provider value={valor}>{children}</SincroGrupoContext.Provider>;
}

/** Estado del auto-guardado en `grupos_avances` para pintarlo en el panel. */
export function useSincronizarGrupo(): Contexto {
  const ctx = useContext(SincroGrupoContext);
  if (!ctx) throw new Error('useSincronizarGrupo debe usarse dentro de <SincroGrupoProvider>');
  return ctx;
}
