/**
 * Shim: reexporta la mini-auditoría del caso activo.
 */
import { casoActivo } from './casos';
export type { ItemAuditoria, Evidencia, Clasificacion } from './casos/tipos';

export const itemsAuditoria = casoActivo.itemsAuditoria;

export const clasificaciones: Array<{
  id: 'conforme' | 'observacion' | 'no-conformidad';
  label: string;
  descripcion: string;
  tono: 'ok' | 'alerta' | 'critico';
}> = [
  { id: 'conforme', label: 'Conformidad', descripcion: 'El requisito se cumple y hay evidencia objetiva que lo respalda.', tono: 'ok' },
  { id: 'observacion', label: 'Observación', descripcion: 'El requisito se cumple, pero con una debilidad que puede derivar en incumplimiento.', tono: 'alerta' },
  { id: 'no-conformidad', label: 'No conformidad', descripcion: 'El requisito no se cumple y existe evidencia objetiva de la desviación.', tono: 'critico' },
];

export const puntosPorAcierto = 15;

export const cicloHallazgo = [
  { paso: 'Hallazgo', detalle: 'Criterio + evidencia objetiva + desviación, escrito sin adjetivos.' },
  { paso: 'Causa', detalle: 'Por qué el sistema permite la desviación, no quién la cometió.' },
  { paso: 'Acción', detalle: 'Corrección inmediata y acción correctiva sobre la causa, con dueño y fecha.' },
  { paso: 'Seguimiento', detalle: 'Evidencia de que la acción se ejecutó como se comprometió.' },
  { paso: 'Eficacia', detalle: 'Datos posteriores que demuestran que la desviación no reapareció.' },
];
