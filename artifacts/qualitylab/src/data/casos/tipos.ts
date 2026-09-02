/**
 * Tipos compartidos por todos los casos del laboratorio.
 *
 * Un `Caso` es la unidad autocontenida: empresa, indicadores, series, dataset
 * de incidencias, ejercicios, teoría, coach, auditoría y misiones. Cambiar de
 * caso al inicio del módulo cambia todo lo que el participante ve.
 */
import type { LucideIcon } from 'lucide-react';

export type Tono = 'critico' | 'alerta' | 'ok';

export interface IndicadorBase {
  id: string;
  label: string;
  valor: number;
  unidad: string;
  meta: number;
  /** true cuando un valor más bajo es mejor (reclamos, retrasos, retrabajos). */
  menorEsMejor: boolean;
  variacion: number;
  contexto: string;
  fuente: string;
  responsable: string;
}

export interface Emes {
  id: string;
  label: string;
  guia: string;
  color: string;
}

export interface SerieDefinicion {
  id: string;
  label: string;
  unidad: string;
  valores: number[];
  meta: number;
  menorEsMejor: boolean;
  lsl: number | null;
  usl: number | null;
  descripcion: string;
}

export interface DefinicionCausa {
  causa: string;
  eme: string;
  area: string;
  responsable: string;
  antes: number;
  despues: number;
  retraso: [number, number];
  costoFijo: number;
  detalle: string;
}

export interface Incidencia {
  id: string;
  semana: number;
  fecha: string;
  periodo: 'antes' | 'despues';
  causa: string;
  eme: string;
  area: string;
  responsable: string;
  cliente: string;
  turno: 'Mañana' | 'Tarde' | 'Noche';
  retrasoHoras: number;
  costo: number;
  lineas: number;
  operario: string;
}

export interface Operario {
  id: string;
  horasCapacitacion: number;
  erroresPicking: number;
  lineasPorHora: number;
  antiguedadMeses: number;
}

export interface PedidoMuestra {
  id: string;
  lineas: number;
  minutos: number;
}

export interface Opcion {
  id: string;
  texto: string;
  feedback: string;
}

export interface Pregunta {
  id: string;
  labId: string;
  enunciado: string;
  contexto?: string;
  opciones: Opcion[];
  correcta: string;
  puntos: number;
  cierre: string;
}

export interface EntradaConocimiento {
  id: string;
  claves: string[];
  titulo: string;
  respuesta: string;
  repregunta: string;
}

export type Clasificacion = 'conforme' | 'observacion' | 'no-conformidad';

export interface Evidencia {
  tipo: 'Documento' | 'Registro' | 'Observación' | 'Entrevista' | 'Indicador' | 'Fotografía';
  detalle: string;
}

export interface ItemAuditoria {
  id: string;
  proceso: string;
  criterio: string;
  pregunta: string;
  evidencias: Evidencia[];
  respuesta: Clasificacion;
  explicacion: string;
  hallazgo: string;
}

export interface BloqueTeoria {
  id: string;
  labId: string;
  sesion: 1 | 2 | 3 | 4;
  titulo: string;
  idea: string;
  definicion: string;
  cuando: string;
  formula?: { expresion: string; explicacion: string };
  pasos: string[];
  errores: string[];
  ejemplo: string;
  minutos: number;
}

export interface Mision {
  id: number;
  clave: string;
  titulo: string;
  kicker: string;
  reto: string;
  labId: string;
  puntos: number;
  minutos: number;
  evidencia: string;
}

export interface Empresa {
  nombre: string;
  sector: string;
  tamano: string;
  encargo: string;
  periodo: string;
}

export interface Economia {
  /** Volumen anual usado para escalar impactos (pedidos, lotes o unidades). */
  volumenAnual: number;
  /** Etiqueta de la unidad de volumen para textos ("pedidos", "lotes", "batches"). */
  volumenLabel: string;
  costoEntregaTardia: number;
  costoReclamo: number;
  costoRetrabajo: number;
  margenPorUnidad: number;
  clientesPerdidosTrimestre: number;
  ventaAnualPorCliente: number;
  inversionMejora: number;
  horasCapacitacion: number;
}

/** Rol interpretable por la IA en la entrevista con el empleado. */
export interface RolEmpleado {
  id: string;
  puesto: string;
  area: string;
  antiguedad: string;
  avatar: string;
  descripcion: string;
  /** Guías que el prompt entrega a la IA para "hablar" en personaje. */
  perspectiva: string;
  /** Datos que este rol conoce de primera mano. */
  sabeDe: string[];
  /** Datos que este rol NO conoce (para calibrar contradicciones). */
  desconoce: string[];
}

/** Un video del proceso que se muestra en Inicio para introducir el caso. */
export interface VideoCaso {
  /** ID de YouTube (últimos caracteres de la URL). */
  youtubeId: string;
  titulo: string;
  minutos: number;
  resumen: string;
}

/**
 * Un caso completo. Todo lo que cambia entre "Distribuidora Andina" y "Fábrica
 * de pintura industrial" vive aquí.
 */
export interface Caso {
  id: string;
  nombreCorto: string;
  emoji: string;
  video: VideoCaso;

  empresa: Empresa;
  indicadoresBase: IndicadorBase[];
  economia: Economia;
  areas: readonly string[];
  responsables: readonly string[];
  seisEmes: readonly Emes[];

  /** SEMANA_INTERVENCION: cuándo se despliega la mejora (para partir el dataset). */
  semanaIntervencion: number;
  totalSemanas: number;

  series: SerieDefinicion[];
  votosIniciales: Record<string, number>;
  muestraPreparacion: number[];
  operarios: Operario[];
  pedidosMuestra: PedidoMuestra[];

  definicionCausas: DefinicionCausa[];
  incidencias: Incidencia[];

  preguntas: Pregunta[];
  baseConocimiento: EntradaConocimiento[];
  frasesQ: Record<string, string[]>;
  itemsAuditoria: ItemAuditoria[];
  teoria: BloqueTeoria[];
  misiones: Mision[];

  /** Roles disponibles para la entrevista con IA. */
  rolesEntrevista: RolEmpleado[];
}
