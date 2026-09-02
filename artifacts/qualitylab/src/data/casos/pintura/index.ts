/**
 * Ensambla el caso "Pinturas del Sur" a partir de sus datos modulares.
 */
import type { Caso } from '../tipos';
import {
  empresa,
  indicadoresBase,
  economia,
  areas,
  responsables,
  seisEmes,
} from './caso';
import {
  series,
  votosIniciales,
  muestraPreparacion,
  operarios,
  pedidosMuestra,
} from './series';
import {
  definicionCausas,
  incidencias,
  SEMANA_INTERVENCION,
  TOTAL_SEMANAS,
} from './incidencias';
import { preguntas } from './quizzes';
import { baseConocimiento, frasesQ } from './coach';
import { itemsAuditoria } from './auditoria';
import { teoria } from './teoria';
import { misiones } from './misiones';
import { rolesEntrevista } from './roles';

export const casoPintura: Caso = {
  id: 'pintura',
  nombreCorto: 'Pinturas del Sur',
  emoji: '🎨',
  video: {
    youtubeId: 'gqnABbQC8Ag',
    titulo: 'Así se fabrica la pintura industrial',
    minutos: 15,
    resumen:
      'Recorrido por una planta real: dispersión, molienda, ajuste de viscosidad, control de calidad, filtrado y envasado. Verás en qué puntos del proceso se generan las desviaciones que Pinturas del Sur debe medir y corregir.',
  },
  empresa,
  indicadoresBase,
  economia: {
    volumenAnual: economia.lotesPorAno,
    volumenLabel: 'lotes',
    costoEntregaTardia: economia.costoLoteRechazado,
    costoReclamo: economia.costoDevolucion,
    costoRetrabajo: economia.costoReproceso,
    margenPorUnidad: economia.margenPorLote,
    clientesPerdidosTrimestre: economia.clientesPerdidosTrimestre,
    ventaAnualPorCliente: economia.ventaAnualPorCliente,
    inversionMejora: economia.inversionMejora,
    horasCapacitacion: economia.horasCapacitacion,
  },
  areas: [...areas],
  responsables: [...responsables],
  seisEmes: [...seisEmes],
  semanaIntervencion: SEMANA_INTERVENCION,
  totalSemanas: TOTAL_SEMANAS,
  series,
  votosIniciales,
  muestraPreparacion,
  operarios,
  pedidosMuestra,
  definicionCausas,
  incidencias,
  preguntas,
  baseConocimiento,
  frasesQ,
  itemsAuditoria,
  teoria,
  misiones,
  rolesEntrevista,
};
