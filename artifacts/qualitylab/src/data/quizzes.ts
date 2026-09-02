/**
 * Shim: reexporta preguntas del caso activo.
 */
import { casoActivo } from './casos';
export type { Pregunta, Opcion } from './casos/tipos';

export const preguntas = casoActivo.preguntas;

export function preguntasDe(labId: string) {
  return preguntas.filter((p) => p.labId === labId);
}

/** Desafíos que el facilitador lanza a la sala: subset por id conocido. */
const IDS_DESAFIOS = ['mejora-1', 'kpi-2', 'stat-1', 'pareto-1', 'audit-1', 'causa-1'];
export const desafiosEnVivo = preguntas.filter((p) => IDS_DESAFIOS.includes(p.id));
