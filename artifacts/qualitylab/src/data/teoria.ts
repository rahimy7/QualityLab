/**
 * Shim: reexporta la teoría del caso activo.
 */
import { casoActivo } from './casos';
export type { BloqueTeoria } from './casos/tipos';

export const teoria = casoActivo.teoria;

export function teoriaDe(labId: string) {
  return teoria.find((t) => t.labId === labId);
}

export const sesiones = [
  { numero: 1 as const, titulo: 'Sesión 1 · Medir con sentido', horas: 2.5, foco: 'Del síntoma al indicador: definir, medir y establecer línea base.' },
  { numero: 2 as const, titulo: 'Sesión 2 · Analizar la causa', horas: 2.5, foco: 'Pareto, Ishikawa y 5 porqués sobre datos reales del caso.' },
  { numero: 3 as const, titulo: 'Sesión 3 · Alinear y controlar', horas: 2.5, foco: 'Hoshin Kanri y control estadístico del proceso.' },
  { numero: 4 as const, titulo: 'Sesión 4 · Demostrar y sostener', horas: 2.5, foco: 'Antes/después con evidencia, auditoría, impacto económico y cierre.' },
];
