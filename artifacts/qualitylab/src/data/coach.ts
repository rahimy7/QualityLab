/**
 * Shim: reexporta el conocimiento del coach del caso activo.
 */
import { casoActivo } from './casos';
export type { EntradaConocimiento } from './casos/tipos';

export const baseConocimiento = casoActivo.baseConocimiento;
export const frasesQ = casoActivo.frasesQ;

export function buscarRespuesta(consulta: string) {
  const texto = consulta.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let mejor: { entrada: (typeof baseConocimiento)[number]; puntaje: number } | null = null;
  for (const entrada of baseConocimiento) {
    let puntaje = 0;
    for (const clave of entrada.claves) {
      const k = clave.normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (texto.includes(k)) puntaje += k.length;
    }
    if (puntaje > 0 && (!mejor || puntaje > mejor.puntaje)) mejor = { entrada, puntaje };
  }
  return mejor ? mejor.entrada : null;
}

export const preguntasSugeridas = [
  '¿Qué gráfico uso para ver si un indicador es estable?',
  '¿Cómo interpreto una brecha de 10 puntos porcentuales?',
  '¿Cuándo tiene sentido priorizar por costo en vez de por frecuencia?',
  '¿Cómo redacto un hallazgo de auditoría?',
];
