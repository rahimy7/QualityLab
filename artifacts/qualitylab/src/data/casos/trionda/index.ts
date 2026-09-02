/**
 * Ensambla el caso Trionda (balón oficial Mundial 2026).
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

export const casoTrionda: Caso = {
  id: 'trionda',
  nombreCorto: 'Adidas Trionda',
  emoji: '⚽',
  video: {
    youtubeId: 'tPr_ngKWH2Y',
    titulo: 'Así se fabrica el balón oficial del Mundial 2026',
    minutos: 8,
    resumen:
      'Recorrido por la fábrica Adidas: láminas de poliuretano, corte de precisión, laminación multicapa, termosellado de cuatro paneles, chip de 500 Hz, inflado, pruebas de resistencia y homologación FIFA (68–70 cm, 410–450 g). Verás dónde se generan las desviaciones que la planta debe medir y corregir.',
  },
  empresa,
  indicadoresBase,
  economia: {
    volumenAnual: economia.balonesPorAno,
    volumenLabel: 'balones',
    costoEntregaTardia: economia.costoBalonRechazado,
    costoReclamo: economia.costoDevolucionFifa,
    costoRetrabajo: economia.costoReproceso,
    margenPorUnidad: economia.margenPorBalon,
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
