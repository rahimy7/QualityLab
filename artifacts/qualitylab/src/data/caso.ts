/**
 * Shim: reexporta del caso activo la información del "caso" (empresa,
 * indicadores base, economía, áreas, responsables y las 6M). Cambiar de caso
 * al inicio del módulo cambia lo que sale por aquí.
 */
import { casoActivo } from './casos';
export type { Tono, IndicadorBase } from './casos/tipos';

export const empresa = casoActivo.empresa;
export const indicadoresBase = casoActivo.indicadoresBase;

/**
 * Economía del caso activo. Además de las llaves genéricas del `Caso`
 * (`volumenAnual`, `margenPorUnidad`), mantenemos aliases con los nombres
 * antiguos (`pedidosPorAno`, `margenPorPedido`) para no romper pantallas
 * como Mejora, Proyecto o Simulador.
 */
export const economia = {
  ...casoActivo.economia,
  pedidosPorAno: casoActivo.economia.volumenAnual,
  margenPorPedido: casoActivo.economia.margenPorUnidad,
} as const;

export const areas = casoActivo.areas;
export const responsables = casoActivo.responsables;
export const seisEmes = casoActivo.seisEmes;

/** Compatibilidad con el uso antiguo: id de una rama de Ishikawa. */
export type EmeId = string;

export { semaforo } from './helpers';
