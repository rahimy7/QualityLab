/**
 * Respaldo automático del avance contra la cuenta.
 *
 * No hay interruptor: si hay sesión, se guarda. El participante no debería
 * tener que acordarse de activar nada para que su trabajo no se pierda, que era
 * el defecto del modo anterior.
 *
 * Va montado en la raíz y no dentro de una pantalla: el participante pasa la
 * clase dentro de los laboratorios, y una sincronización que viva en el panel
 * de Inicio deja de guardar en cuanto navega a otro sitio.
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
import { useProgreso } from './progreso';

const DEBOUNCE_MS = 2500;
/**
 * `keepalive` deja que la petición termine aunque la pestaña se cierre, pero
 * los navegadores lo limitan a 64 KB de cuerpo.
 */
const LIMITE_KEEPALIVE = 60_000;

export type EstadoSincro = 'pendiente' | 'guardando' | 'ok' | 'error';

interface Contexto {
  sincro: EstadoSincro;
  ultimo: string | null;
  error: string | null;
  /** Envía de inmediato, sin esperar el debounce. */
  forzar: () => Promise<void>;
}

const SincroContext = createContext<Contexto | null>(null);

export function SincroUsuarioProvider({ children }: { children: ReactNode }) {
  const { estado } = useProgreso();
  const [sincro, setSincro] = useState<EstadoSincro>('ok');
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const temporizador = useRef<number | null>(null);
  /** Hay cambios que todavía no llegaron al servidor. */
  const pendiente = useRef(false);
  /** Evita guardar el estado recién cargado del servidor nada más montar. */
  const primeraVez = useRef(true);

  const enviar = useCallback(
    async (alCerrar = false) => {
      const cuerpo = JSON.stringify({ casoId: casoActivoId, contenido: estado });
      setSincro('guardando');
      setError(null);
      try {
        const r = await fetch('/api/mi-avance', {
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
    [estado],
  );

  const enviarRef = useRef(enviar);
  useEffect(() => {
    enviarRef.current = enviar;
  }, [enviar]);

  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    setSincro((s) => (s === 'error' ? s : 'pendiente'));
    pendiente.current = true;
    temporizador.current = window.setTimeout(() => {
      void enviar();
    }, DEBOUNCE_MS);
    return () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    };
  }, [enviar]);

  /**
   * El debounce deja una ventana en la que el último cambio aún no viajó. Si el
   * participante cierra la pestaña o cambia de app —lo normal al terminar la
   * clase, y más en el celular— se envía de inmediato en vez de perderlo.
   */
  useEffect(() => {
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
  }, []);

  const valor = useMemo(
    () => ({ sincro, ultimo, error, forzar: enviar }),
    [sincro, ultimo, error, enviar],
  );

  return <SincroContext.Provider value={valor}>{children}</SincroContext.Provider>;
}

export function useSincroUsuario(): Contexto {
  const ctx = useContext(SincroContext);
  if (!ctx) throw new Error('useSincroUsuario debe usarse dentro de <SincroUsuarioProvider>');
  return ctx;
}
