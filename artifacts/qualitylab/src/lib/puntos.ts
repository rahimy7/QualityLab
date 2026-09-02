/**
 * Reglas de Quality Points, en un solo lugar.
 *
 * Las usan tres consumidores que deben coincidir siempre: el estado del
 * participante (`store/progreso`), el ranking de la sala y la revisión por
 * grupo del facilitador. Lo que se guarda en la nube es el avance, no el
 * puntaje, así que todos recalculan contra el catálogo vigente del caso.
 */
import { logros } from '@/data/labs';
import type { Caso } from '@/data/casos/tipos';

/** Los tres campos del estado con los que se calculan los puntos. */
export interface AvancePuntuable {
  misiones: string[];
  quiz: Record<string, string>;
  logros: string[];
}

export interface Puntaje {
  total: number;
  porMisiones: number;
  porQuiz: number;
  porLogros: number;
  /** Misiones completadas. */
  misiones: number;
  /** Ejercicios contestados (una sola oportunidad por pregunta). */
  respondidas: number;
  /** Ejercicios contestados correctamente. */
  correctas: number;
  /** Logros desbloqueados. */
  logros: number;
}

export const puntajeVacio: Puntaje = {
  total: 0,
  porMisiones: 0,
  porQuiz: 0,
  porLogros: 0,
  misiones: 0,
  respondidas: 0,
  correctas: 0,
  logros: 0,
};

/**
 * El avance puede llegar del servidor como JSON opaco (guardado por una
 * versión anterior de la app), así que cada campo se valida antes de contarlo.
 */
export function normalizar(contenido: Record<string, unknown>): AvancePuntuable {
  const { misiones, quiz, logros: logrosGuardados } = contenido as Partial<AvancePuntuable>;
  return {
    misiones: Array.isArray(misiones) ? misiones : [],
    quiz: quiz && typeof quiz === 'object' && !Array.isArray(quiz) ? quiz : {},
    logros: Array.isArray(logrosGuardados) ? logrosGuardados : [],
  };
}

export function calcularPuntos(avance: AvancePuntuable, caso: Caso | undefined): Puntaje {
  // Sin el caso no hay catálogo de misiones ni de preguntas contra el que
  // puntuar: mejor no mostrar nada que mostrar un cero engañoso.
  if (!caso) return puntajeVacio;

  const porMisiones = caso.misiones
    .filter((m) => avance.misiones.includes(m.clave))
    .reduce((acc, m) => acc + m.puntos, 0);

  const preguntasPorId = new Map(caso.preguntas.map((p) => [p.id, p]));
  let correctas = 0;
  let porQuiz = 0;
  for (const [preguntaId, opcionId] of Object.entries(avance.quiz)) {
    const p = preguntasPorId.get(preguntaId);
    if (p && p.correcta === opcionId) {
      correctas += 1;
      porQuiz += p.puntos;
    }
  }

  const porLogros = logros
    .filter((l) => avance.logros.includes(l.id))
    .reduce((acc, l) => acc + l.puntos, 0);

  return {
    total: porMisiones + porQuiz + porLogros,
    porMisiones,
    porQuiz,
    porLogros,
    misiones: avance.misiones.length,
    respondidas: Object.keys(avance.quiz).length,
    correctas,
    logros: avance.logros.length,
  };
}

export function sumar(a: Puntaje, b: Puntaje): Puntaje {
  return {
    total: a.total + b.total,
    porMisiones: a.porMisiones + b.porMisiones,
    porQuiz: a.porQuiz + b.porQuiz,
    porLogros: a.porLogros + b.porLogros,
    misiones: a.misiones + b.misiones,
    respondidas: a.respondidas + b.respondidas,
    correctas: a.correctas + b.correctas,
    logros: a.logros + b.logros,
  };
}
