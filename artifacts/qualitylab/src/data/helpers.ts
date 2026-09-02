/**
 * Helpers compartidos por todos los casos: no dependen del caso activo.
 */
import type { Tono } from './casos/tipos';

/** Semáforo estándar del módulo: se usa en KPI Lab, Dashboard y Auditoría. */
export function semaforo(
  valor: number,
  meta: number,
  menorEsMejor: boolean,
): { tono: Tono; etiqueta: string; brecha: number } {
  const brecha = menorEsMejor ? valor - meta : meta - valor;
  const tolerancia = Math.abs(meta) * 0.15;
  if (brecha <= 0) return { tono: 'ok', etiqueta: 'En meta', brecha };
  if (brecha <= tolerancia) return { tono: 'alerta', etiqueta: 'En alerta', brecha };
  return { tono: 'critico', etiqueta: 'Fuera de meta', brecha };
}
