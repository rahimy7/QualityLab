/**
 * Shim: reexporta labs (compartido), logros (compartido) y misiones (del caso
 * activo). Mantiene el API antiguo para no reescribir consumidores.
 */
import { casoActivo } from './casos';
import { preguntas } from './quizzes';
import { puntosLogros } from './labs';

export { labs, lab, logros, puntosLogros } from './labs';
export type { Lab, Logro } from './labs';
export type { Mision } from './casos/tipos';

export const misiones = casoActivo.misiones;
export const puntosTotales = misiones.reduce((acc, m) => acc + m.puntos, 0);
export const puntosEjercicios = preguntas.reduce((acc, p) => acc + p.puntos, 0);

/** Techo del módulo para el caso activo: misiones + ejercicios + logros. */
export const puntosPosibles = puntosTotales + puntosEjercicios + puntosLogros;
