/**
 * Estado del participante.
 *
 * Todo el avance vive en el navegador (localStorage): la plataforma funciona
 * sin cuenta ni servidor, que es lo que permite entrar con un QR y empezar a
 * trabajar en el primer minuto de clase.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { equipos } from '@/data/equipos';
import { misiones } from '@/data/misiones';
import { casoActivo, casoActivoId } from '@/data/casos';
import { calcularPuntos, type Puntaje } from '@/lib/puntos';
import type { Clasificacion } from '@/data/auditoria';
import type { EmeId } from '@/data/caso';

/**
 * La clave de storage cuelga del caso activo: cada caso guarda su propio
 * avance y cambiar de caso conserva lo trabajado en el otro. El prefijo v1 se
 * mantiene para no romper el avance existente del caso Andina.
 */
const CLAVE = casoActivoId === 'andina'
  ? 'qualitylab360.v1'
  : `qualitylab360.v1.${casoActivoId}`;

export interface FichaKpi {
  objetivo: string;
  indicador: string;
  formula: string;
  lineaBase: string;
  meta: string;
  fecha: string;
  frecuencia: string;
  fuente: string;
  responsable: string;
  umbral: string;
}

export interface CausaIshikawa {
  id: string;
  texto: string;
  impacto: 1 | 2 | 3;
  tieneEvidencia: boolean;
}

export interface PasoPorque {
  pregunta: string;
  respuesta: string;
  evidencia: string;
}

export interface Hoshin {
  objetivo: string;
  meta: string;
  kpis: string[];
  iniciativas: string[];
  responsables: string[];
  /** Cruces marcados en la X-Matrix: "iniciativaIndex-kpiIndex". */
  cruces: string[];
}

export interface EstadoApp {
  perfil: { nombre: string; equipoId: string };
  quiz: Record<string, string>;
  misiones: string[];
  logros: string[];
  voto: string | null;
  argumentoVoto: string;
  kpi: FichaKpi;
  pareto: {
    criterio: 'frecuencia' | 'costo' | 'horas';
    periodo: 'todo' | 'antes' | 'despues';
    corte: number;
    seleccionadas: string[];
    /** Criterios de priorización que el participante llegó a explorar. */
    criteriosVistos: string[];
  };
  ishikawa: Record<string, CausaIshikawa[]>;
  porques: PasoPorque[];
  causaRaiz: { enunciado: string; evidencia: string; tipo: string };
  hoshin: Hoshin;
  auditoria: Record<string, Clasificacion>;
  mejora: { inicioDespues: number; conclusion: string };
  control: { serieId: string; puntosMarcados: number[] };
  simulador: { espera: number; retrabajo: number; defectos: number; ubicaciones: number };
  proyecto: Record<string, string>;
}

const fichaVacia: FichaKpi = {
  objetivo: '',
  indicador: '',
  formula: '',
  lineaBase: '',
  meta: '',
  fecha: '',
  frecuencia: '',
  fuente: '',
  responsable: '',
  umbral: '',
};

export const estadoInicial: EstadoApp = {
  perfil: { nombre: '', equipoId: equipos[0].id },
  quiz: {},
  misiones: [],
  logros: [],
  voto: null,
  argumentoVoto: '',
  kpi: fichaVacia,
  pareto: { criterio: 'frecuencia', periodo: 'todo', corte: 80, seleccionadas: [], criteriosVistos: ['frecuencia'] },
  ishikawa: { metodo: [], 'mano-obra': [], maquina: [], material: [], medicion: [], medio: [] },
  porques: [
    { pregunta: '¿Por qué el pedido se entregó tarde?', respuesta: '', evidencia: '' },
    { pregunta: '¿Por qué ocurrió eso?', respuesta: '', evidencia: '' },
    { pregunta: '¿Por qué ocurrió eso?', respuesta: '', evidencia: '' },
    { pregunta: '¿Por qué ocurrió eso?', respuesta: '', evidencia: '' },
    { pregunta: '¿Por qué ocurrió eso?', respuesta: '', evidencia: '' },
  ],
  causaRaiz: { enunciado: '', evidencia: '', tipo: '' },
  hoshin: {
    objetivo: '',
    meta: '',
    kpis: ['', '', ''],
    iniciativas: ['', '', ''],
    responsables: ['', '', ''],
    cruces: [],
  },
  auditoria: {},
  mejora: { inicioDespues: 13, conclusion: '' },
  control: { serieId: 'preparacion', puntosMarcados: [] },
  simulador: { espera: 20, retrabajo: 12, defectos: 8, ubicaciones: 0 },
  proyecto: {},
};

/**
 * Mezcla superficial contra el estado inicial: una versión nueva con campos
 * añadidos no rompe el progreso ya guardado, y un avance que llega del
 * servidor tampoco puede dejar el estado incompleto.
 */
export function fusionarEstado(guardado: Partial<EstadoApp>): EstadoApp {
  return {
      ...estadoInicial,
      ...guardado,
      perfil: { ...estadoInicial.perfil, ...guardado.perfil },
      kpi: { ...estadoInicial.kpi, ...guardado.kpi },
      pareto: { ...estadoInicial.pareto, ...guardado.pareto },
      ishikawa: { ...estadoInicial.ishikawa, ...guardado.ishikawa },
      causaRaiz: { ...estadoInicial.causaRaiz, ...guardado.causaRaiz },
      hoshin: { ...estadoInicial.hoshin, ...guardado.hoshin },
      mejora: { ...estadoInicial.mejora, ...guardado.mejora },
      control: { ...estadoInicial.control, ...guardado.control },
      simulador: { ...estadoInicial.simulador, ...guardado.simulador },
      porques: guardado.porques?.length ? guardado.porques : estadoInicial.porques,
  };
}

function cargar(): EstadoApp {
  if (typeof window === 'undefined') return estadoInicial;
  try {
    const raw = window.localStorage.getItem(CLAVE);
    if (!raw) return estadoInicial;
    return fusionarEstado(JSON.parse(raw) as Partial<EstadoApp>);
  } catch {
    return estadoInicial;
  }
}

/**
 * `set` acepta también una función: los toggles (marcar causas, cruces de la
 * X-Matrix, puntos de la carta de control) deben partir del estado más reciente
 * y no del que capturó el render, o dos toques rápidos pierden el primero.
 */
type Actualizacion = Partial<EstadoApp> | ((prev: EstadoApp) => Partial<EstadoApp>);

interface Contexto {
  estado: EstadoApp;
  set: (parcial: Actualizacion) => void;
  responder: (preguntaId: string, opcionId: string) => void;
  completarMision: (clave: string) => void;
  otorgarLogro: (id: string) => void;
  quitarLogro: (id: string) => void;
  /** Sustituye todo el avance, por ejemplo al restaurarlo desde el servidor. */
  reemplazar: (estado: Partial<EstadoApp>) => void;
  reiniciar: () => void;
  /** Recalculado con las mismas reglas que ve el facilitador. */
  puntos: Puntaje;
  avance: number;
}

const ProgresoContext = createContext<Contexto | null>(null);

export function ProgresoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoApp>(cargar);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      // Modo privado o almacenamiento lleno: la sesión sigue funcionando en memoria.
    }
  }, [estado]);

  const set = useCallback((parcial: Actualizacion) => {
    setEstado((prev) => ({ ...prev, ...(typeof parcial === 'function' ? parcial(prev) : parcial) }));
  }, []);

  const responder = useCallback((preguntaId: string, opcionId: string) => {
    setEstado((prev) =>
      // Una sola oportunidad por pregunta: la retroalimentación pierde valor si
      // el participante puede probar hasta acertar.
      prev.quiz[preguntaId] ? prev : { ...prev, quiz: { ...prev.quiz, [preguntaId]: opcionId } },
    );
  }, []);

  const completarMision = useCallback((clave: string) => {
    setEstado((prev) =>
      prev.misiones.includes(clave) ? prev : { ...prev, misiones: [...prev.misiones, clave] },
    );
  }, []);

  const otorgarLogro = useCallback((id: string) => {
    setEstado((prev) => (prev.logros.includes(id) ? prev : { ...prev, logros: [...prev.logros, id] }));
  }, []);

  const quitarLogro = useCallback((id: string) => {
    setEstado((prev) =>
      prev.logros.includes(id) ? { ...prev, logros: prev.logros.filter((l) => l !== id) } : prev,
    );
  }, []);

  const reemplazar = useCallback((nuevo: Partial<EstadoApp>) => {
    setEstado(fusionarEstado(nuevo));
  }, []);

  const reiniciar = useCallback(() => {
    setEstado((prev) => ({ ...estadoInicial, perfil: prev.perfil }));
  }, []);

  const puntos = useMemo(
    () =>
      calcularPuntos(
        { misiones: estado.misiones, quiz: estado.quiz, logros: estado.logros },
        casoActivo,
      ),
    [estado.misiones, estado.quiz, estado.logros],
  );

  const avance = useMemo(
    () => Math.round((estado.misiones.length / misiones.length) * 100),
    [estado.misiones.length],
  );

  const valor = useMemo(
    () => ({ estado, set, responder, completarMision, otorgarLogro, quitarLogro, reemplazar, reiniciar, puntos, avance }),
    [estado, set, responder, completarMision, otorgarLogro, quitarLogro, reemplazar, reiniciar, puntos, avance],
  );

  return <ProgresoContext.Provider value={valor}>{children}</ProgresoContext.Provider>;
}

export function useProgreso(): Contexto {
  const ctx = useContext(ProgresoContext);
  if (!ctx) throw new Error('useProgreso debe usarse dentro de <ProgresoProvider>');
  return ctx;
}

export type { EmeId };
