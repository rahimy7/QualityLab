/**
 * Shim: reexporta series y muestras del caso activo.
 */
import { casoActivo } from './casos';
export type { SerieDefinicion, Operario } from './casos/tipos';

export const series = casoActivo.series;
export const semanas = Array.from({ length: casoActivo.totalSemanas }, (_, i) => i + 1);
export const votosIniciales = casoActivo.votosIniciales;
export const muestraPreparacion = casoActivo.muestraPreparacion;
export const operarios = casoActivo.operarios;
export const pedidosMuestra = casoActivo.pedidosMuestra;

/**
 * Primer indicador de la serie del caso: se toma como "el indicador principal"
 * para compatibilidad con pantallas antiguas que importaban `entregasTardias`.
 * Cada caso decide qué serie es la protagonista (Andina: entregas tardías;
 * Pintura: reprocesos).
 */
export const serieProtagonista =
  casoActivo.series.find((s) => s.id === 'entregas') ??
  casoActivo.series.find((s) => s.id === 'reprocesos') ??
  casoActivo.series[0];

export const entregasTardias = serieProtagonista.valores;

export const entregasAntes = entregasTardias.slice(0, casoActivo.semanaIntervencion - 1);
export const entregasDespues = entregasTardias.slice(casoActivo.semanaIntervencion - 1);

/** Tiempo de preparación / dispersión (segunda serie): usada en Estadística. */
export const tiempoPreparacion =
  casoActivo.series.find((s) => s.id === 'preparacion')?.valores
  ?? casoActivo.series.find((s) => s.id === 'dispersion')?.valores
  ?? casoActivo.series[1].valores;

export function serie(id: string) {
  return casoActivo.series.find((s) => s.id === id) ?? casoActivo.series[0];
}
