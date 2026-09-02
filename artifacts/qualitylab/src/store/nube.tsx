/**
 * Sincronización con el servidor.
 *
 * La regla que ordena todo este archivo: el trabajo del participante nunca
 * depende de la red. localStorage sigue siendo la fuente de la que vive la
 * pantalla; la base de datos es un espejo duradero que además le da al
 * facilitador la vista del aula. Si el wifi cae —y en un aula cae— la clase
 * continúa y lo pendiente se envía cuando vuelve.
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
import { obtenerSesion, unirseSesion, guardarAvance, type Avance } from '@workspace/api-client-react';
import { preguntas } from '@/data/quizzes';
import { casoActivoId } from '@/data/casos';
import { idDispositivo } from '@/lib/dispositivo';
import { useProgreso, type EstadoApp } from './progreso';

/** El estado de la nube también se scopea al caso activo. */
const CLAVE = casoActivoId === 'andina'
  ? 'qualitylab360.nube'
  : `qualitylab360.nube.${casoActivoId}`;
const DEBOUNCE_MS = 2500;
const LATIDO_MS = 90_000;

export type EstadoConexion =
  | 'sin-sesion'
  | 'conectando'
  | 'sincronizado'
  | 'guardando'
  | 'pendiente'
  | 'error';

interface Vinculo {
  codigo: string;
  sesionNombre: string;
  participanteId: string;
}

function leerVinculo(): Vinculo | null {
  try {
    const raw = window.localStorage.getItem(CLAVE);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Vinculo>;
    return v.codigo && v.participanteId ? (v as Vinculo) : null;
  } catch {
    return null;
  }
}

function guardarVinculo(v: Vinculo | null): void {
  try {
    if (v) window.localStorage.setItem(CLAVE, JSON.stringify(v));
    else window.localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento el vínculo dura lo que la pestaña.
  }
}

/** Respuestas del participante con su corrección, tal como las espera la API. */
function respuestasDe(estado: EstadoApp) {
  return Object.entries(estado.quiz).map(([preguntaId, opcionId]) => ({
    preguntaId,
    opcionId,
    correcta: preguntas.find((p) => p.id === preguntaId)?.correcta === opcionId,
  }));
}

function mensajeDeError(e: unknown): string {
  if (e && typeof e === 'object' && 'status' in e) {
    const status = (e as { status: number }).status;
    if (status === 404) return 'La sesión ya no existe. Pide el código nuevo al facilitador.';
    if (status >= 500) return 'El servidor no responde. Tu avance sigue guardado en este dispositivo.';
  }
  return 'Sin conexión con el servidor. Tu avance sigue guardado en este dispositivo.';
}

interface Contexto {
  vinculo: Vinculo | null;
  conexion: EstadoConexion;
  /** Estado transitorio de la última operación de red. */
  mensaje: string | null;
  /** Aviso que el participante debe leer (por ejemplo, avance restaurado). */
  aviso: string | null;
  descartarAviso: () => void;
  ultimaSync: Date | null;
  /** Avance del servidor a la espera de que el participante decida. */
  conflicto: Avance | null;
  unirse: (codigo: string) => Promise<boolean>;
  salir: () => void;
  resolverConflicto: (cual: 'local' | 'nube') => void;
  guardarAhora: () => Promise<void>;
}

const NubeContext = createContext<Contexto | null>(null);

export function NubeProvider({ children }: { children: ReactNode }) {
  const { estado, puntos, reemplazar } = useProgreso();
  const [vinculo, setVinculo] = useState<Vinculo | null>(() =>
    typeof window === 'undefined' ? null : leerVinculo(),
  );
  const [conexion, setConexion] = useState<EstadoConexion>(vinculo ? 'sincronizado' : 'sin-sesion');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ultimaSync, setUltimaSync] = useState<Date | null>(null);
  const [conflicto, setConflicto] = useState<Avance | null>(null);

  // Refs para que el guardado diferido y el latido lean siempre lo último sin
  // reprogramarse en cada tecla que escribe el participante.
  const estadoRef = useRef(estado);
  const puntosRef = useRef(puntos.total);
  estadoRef.current = estado;
  puntosRef.current = puntos.total;

  const enviar = useCallback(async (participanteId: string): Promise<void> => {
    const actual = estadoRef.current;
    setConexion('guardando');
    try {
      await guardarAvance(participanteId, {
        puntos: puntosRef.current,
        misiones: actual.misiones,
        logros: actual.logros,
        respuestas: respuestasDe(actual),
        estado: actual as unknown as Record<string, unknown>,
      });
      setConexion('sincronizado');
      setUltimaSync(new Date());
      setMensaje(null);
    } catch (e) {
      setConexion('pendiente');
      setMensaje(mensajeDeError(e));
    }
  }, []);

  /* --------------------------- Guardado diferido --------------------------- */

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!vinculo || conflicto) return undefined;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => void enviar(vinculo.participanteId), DEBOUNCE_MS);
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
    // `estado` entero como dependencia: cualquier cambio del participante cuenta.
  }, [estado, puntos.total, vinculo, conflicto, enviar]);

  /* ------------------- Latido y reintento al volver la red ------------------ */

  useEffect(() => {
    if (!vinculo) return undefined;
    const id = setInterval(() => void enviar(vinculo.participanteId), LATIDO_MS);
    const alVolver = () => void enviar(vinculo.participanteId);
    window.addEventListener('online', alVolver);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', alVolver);
    };
  }, [vinculo, enviar]);

  /* -------------------------------- Unirse -------------------------------- */

  const unirse = useCallback(
    async (codigoCrudo: string): Promise<boolean> => {
      const codigo = codigoCrudo.trim().toUpperCase();
      if (codigo.length < 4) {
        setMensaje('El código de sesión es demasiado corto.');
        setConexion('error');
        return false;
      }

      setConexion('conectando');
      setMensaje(null);

      try {
        // Se comprueba primero que la sesión exista para dar un error claro
        // antes de crear nada.
        await obtenerSesion(codigo);

        const actual = estadoRef.current;
        const inscripcion = await unirseSesion(codigo, {
          dispositivoId: idDispositivo(),
          nombre: actual.perfil.nombre.trim() || 'Participante',
          equipoId: actual.perfil.equipoId,
        });

        const nuevo: Vinculo = {
          codigo: inscripcion.sesion.codigo,
          sesionNombre: inscripcion.sesion.nombre,
          participanteId: inscripcion.participante.id,
        };
        guardarVinculo(nuevo);
        setVinculo(nuevo);

        const remoto = inscripcion.avance;
        const sinAvanceLocal = actual.misiones.length === 0 && puntosRef.current === 0;

        if (remoto && remoto.puntos > 0) {
          if (sinAvanceLocal) {
            // Dispositivo nuevo y nada que perder: se restaura sin preguntar.
            reemplazar(remoto.estado as Partial<EstadoApp>);
            setConexion('sincronizado');
            setUltimaSync(new Date());
            // Va como aviso y no como mensaje: el guardado automático que viene
            // detrás no debe borrar la confirmación antes de que la lean.
            setAviso(
              `Recuperamos tu avance de esta sesión: ${remoto.puntos} Quality Points y ${remoto.misiones.length} misiones.`,
            );
          } else {
            // Hay trabajo en los dos lados: la decisión es del participante.
            setConflicto(remoto);
            setConexion('sincronizado');
          }
        } else {
          await enviar(nuevo.participanteId);
        }

        return true;
      } catch (e) {
        setConexion('error');
        setMensaje(mensajeDeError(e));
        return false;
      }
    },
    [enviar, reemplazar],
  );

  const resolverConflicto = useCallback(
    (cual: 'local' | 'nube') => {
      const remoto = conflicto;
      setConflicto(null);
      if (!remoto || !vinculo) return;

      if (cual === 'nube') {
        reemplazar(remoto.estado as Partial<EstadoApp>);
        setAviso(
          `Recuperamos tu avance de esta sesión: ${remoto.puntos} Quality Points y ${remoto.misiones.length} misiones.`,
        );
      } else {
        void enviar(vinculo.participanteId);
      }
    },
    [conflicto, vinculo, reemplazar, enviar],
  );

  /* ------------- El perfil que cambia después de unirse ------------------- */

  const perfilRef = useRef('');

  useEffect(() => {
    if (!vinculo) return undefined;
    const firma = `${estado.perfil.nombre.trim()}|${estado.perfil.equipoId}`;
    if (firma === perfilRef.current) return undefined;

    const id = setTimeout(() => {
      perfilRef.current = firma;
      // `unirseSesion` con el mismo dispositivo es idempotente: actualiza el
      // nombre y el equipo del participante sin crear uno nuevo.
      void unirseSesion(vinculo.codigo, {
        dispositivoId: idDispositivo(),
        nombre: estado.perfil.nombre.trim() || 'Participante',
        equipoId: estado.perfil.equipoId,
      }).catch(() => {
        // Se reintenta en el próximo cambio o al recargar; no bloquea nada.
        perfilRef.current = '';
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [estado.perfil.nombre, estado.perfil.equipoId, vinculo]);

  /* ------------------ Auto-unión desde el enlace del QR ------------------- */

  const yaIntentado = useRef(false);

  useEffect(() => {
    if (vinculo || yaIntentado.current) return;
    const codigo = new URLSearchParams(window.location.search).get('sesion');
    if (!codigo) return;
    yaIntentado.current = true;
    void unirse(codigo).then(() => {
      // Se limpia el parámetro para que recargar no vuelva a disparar la unión
      // ni deje el código a la vista en la barra del navegador.
      const url = new URL(window.location.href);
      url.searchParams.delete('sesion');
      window.history.replaceState({}, '', url.toString());
    });
  }, [vinculo, unirse]);

  const salir = useCallback(() => {
    guardarVinculo(null);
    setVinculo(null);
    setConflicto(null);
    setConexion('sin-sesion');
    setMensaje(null);
    setAviso(null);
    perfilRef.current = '';
  }, []);

  const descartarAviso = useCallback(() => setAviso(null), []);

  const guardarAhora = useCallback(async () => {
    if (vinculo) await enviar(vinculo.participanteId);
  }, [vinculo, enviar]);

  const valor = useMemo(
    () => ({ vinculo, conexion, mensaje, aviso, descartarAviso, ultimaSync, conflicto, unirse, salir, resolverConflicto, guardarAhora }),
    [vinculo, conexion, mensaje, aviso, descartarAviso, ultimaSync, conflicto, unirse, salir, resolverConflicto, guardarAhora],
  );

  return <NubeContext.Provider value={valor}>{children}</NubeContext.Provider>;
}

export function useNube(): Contexto {
  const ctx = useContext(NubeContext);
  if (!ctx) throw new Error('useNube debe usarse dentro de <NubeProvider>');
  return ctx;
}
