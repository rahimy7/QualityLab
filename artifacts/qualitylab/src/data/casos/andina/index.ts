/**
 * Ensambla el caso "Distribuidora Andina" a partir de sus datos modulares.
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

export const casoAndina: Caso = {
  id: 'andina',
  nombreCorto: 'Distribuidora Andina',
  emoji: '📦',
  video: {
    youtubeId: 'oJTwQvgfgMM',
    titulo: 'Así funciona un centro de distribución moderno',
    minutos: 12,
    resumen:
      'Un recorrido por un CD real: recepción, put-away, picking, empaque y despacho. Verás en qué punto del proceso se generan los retrasos y errores que después Distribuidora Andina debe medir y corregir.',
  },
  empresa,
  indicadoresBase,
  economia: {
    volumenAnual: economia.pedidosPorAno,
    volumenLabel: 'pedidos',
    costoEntregaTardia: economia.costoEntregaTardia,
    costoReclamo: economia.costoReclamo,
    costoRetrabajo: economia.costoRetrabajo,
    margenPorUnidad: economia.margenPorPedido,
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
