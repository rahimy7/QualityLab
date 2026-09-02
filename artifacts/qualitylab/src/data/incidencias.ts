/**
 * Shim: reexporta el dataset de incidencias del caso activo.
 */
import { casoActivo } from './casos';
export type { Incidencia, DefinicionCausa } from './casos/tipos';

export const SEMANA_INTERVENCION = casoActivo.semanaIntervencion;
export const TOTAL_SEMANAS = casoActivo.totalSemanas;
export const definicionCausas = casoActivo.definicionCausas;
export const incidencias = casoActivo.incidencias;
export const incidenciasAntes = incidencias.filter((i) => i.periodo === 'antes');
export const incidenciasDespues = incidencias.filter((i) => i.periodo === 'despues');

export function incidenciasPorPeriodo(periodo: 'todo' | 'antes' | 'despues') {
  if (periodo === 'todo') return incidencias;
  return incidencias.filter((i) => i.periodo === periodo);
}

export const columnasCsv: Array<{ key: keyof (typeof incidencias)[number]; label: string }> = [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'semana', label: 'Semana' },
  { key: 'periodo', label: 'Periodo' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'causa', label: 'Causa' },
  { key: 'area', label: 'Area' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'turno', label: 'Turno' },
  { key: 'lineas', label: 'Lineas' },
  { key: 'retrasoHoras', label: 'Retraso (h)' },
  { key: 'costo', label: 'Costo no calidad (USD)' },
  { key: 'operario', label: 'Operario' },
];

export function incidenciasCsv(rows: typeof incidencias = incidencias): string {
  const head = columnasCsv.map((c) => c.label).join(',');
  const body = rows
    .map((row) => columnasCsv.map((c) => String(row[c.key])).join(','))
    .join('\n');
  return `${head}\n${body}`;
}
