/**
 * Registro de incidencias de entrega de Distribuidora Andina.
 *
 * 148 pedidos con desviación durante 24 semanas. Se generan con semilla fija:
 * el dataset es idéntico para toda la clase y puede descargarse en CSV para
 * trabajarlo también en Excel.
 */
import { normal, pick, roundTo, seeded } from '@/lib/random';
import type { EmeId } from './caso';

export const SEMANA_INTERVENCION = 13;
export const TOTAL_SEMANAS = 24;

export interface DefinicionCausa {
  causa: string;
  eme: EmeId;
  area: string;
  responsable: string;
  antes: number;
  despues: number;
  /** Rango de horas de retraso típico de esta causa. */
  retraso: [number, number];
  /**
   * Costo fijo de no calidad por evento, en USD, aparte del que genera el
   * retraso. Es lo que hace que el Pareto por costo no coincida con el de
   * frecuencia: un error de picking es menos frecuente pero mucho más caro.
   */
  costoFijo: number;
  detalle: string;
}

/**
 * Los conteos vienen del reporte que entrega la gerencia. La caída fuerte de
 * las dos primeras causas después de la semana 13 es lo que el participante
 * debe descubrir al recalcular el Pareto por periodo.
 */
export const definicionCausas: DefinicionCausa[] = [
  {
    causa: 'Retraso de proveedor',
    eme: 'material',
    area: 'Compras',
    responsable: 'Compras',
    antes: 44,
    despues: 12,
    retraso: [18, 96],
    costoFijo: 12,
    detalle: 'El insumo llegó después de la fecha confirmada en la orden de compra.',
  },
  {
    causa: 'Error de picking',
    eme: 'mano-obra',
    area: 'Almacén',
    responsable: 'Almacén',
    antes: 31,
    despues: 7,
    retraso: [6, 30],
    costoFijo: 230,
    detalle:
      'Se preparó producto o cantidad distinta a la del pedido: devolución, re-despacho y nota de crédito.',
  },
  {
    causa: 'Transporte y ruta',
    eme: 'medio',
    area: 'Transporte',
    responsable: 'Transporte',
    antes: 18,
    despues: 9,
    retraso: [8, 40],
    costoFijo: 46,
    detalle: 'Ruta reprogramada, vehículo no disponible o incidencia en carretera.',
  },
  {
    causa: 'Documentación incompleta',
    eme: 'metodo',
    area: 'Despacho',
    responsable: 'Logística',
    antes: 11,
    despues: 4,
    retraso: [4, 20],
    costoFijo: 18,
    detalle: 'Falta de guía, factura o certificado que detiene la salida del pedido.',
  },
  {
    causa: 'Cambio de prioridad',
    eme: 'metodo',
    area: 'Servicio al cliente',
    responsable: 'Comercial',
    antes: 5,
    despues: 2,
    retraso: [10, 48],
    costoFijo: 29,
    detalle: 'Un pedido entra como urgente y desplaza a otro que ya estaba en preparación.',
  },
  {
    causa: 'Falla de equipo',
    eme: 'maquina',
    area: 'Almacén',
    responsable: 'Almacén',
    antes: 3,
    despues: 2,
    retraso: [12, 56],
    costoFijo: 64,
    detalle: 'Montacargas, terminal de radiofrecuencia o impresora fuera de servicio.',
  },
];

export interface Incidencia {
  id: string;
  semana: number;
  fecha: string;
  periodo: 'antes' | 'despues';
  causa: string;
  eme: EmeId;
  area: string;
  responsable: string;
  cliente: string;
  turno: 'Mañana' | 'Tarde' | 'Noche';
  /** Horas transcurridas entre la fecha comprometida y la entrega real. */
  retrasoHoras: number;
  /** Costo de no calidad asociado al pedido, en USD. */
  costo: number;
  lineas: number;
  operario: string;
}

const clientes = [
  'Supermercados Vega',
  'Farmacenter',
  'Grupo Solano',
  'Minimarket Ríos',
  'Distribuidora Sur',
  'Comercial Puerto',
  'Autoservicio León',
  'Mayorista Central',
];

const turnos = ['Mañana', 'Tarde', 'Noche'] as const;

/** Lunes de la semana 1 del periodo analizado. */
const INICIO = new Date(Date.UTC(2025, 0, 6));

function fechaDeSemana(semana: number, diaOffset: number): string {
  const d = new Date(INICIO);
  d.setUTCDate(d.getUTCDate() + (semana - 1) * 7 + diaOffset);
  return d.toISOString().slice(0, 10);
}

function construir(): Incidencia[] {
  const rand = seeded(20260825);
  const out: Incidencia[] = [];
  let n = 0;

  for (const def of definicionCausas) {
    for (const periodo of ['antes', 'despues'] as const) {
      const cantidad = periodo === 'antes' ? def.antes : def.despues;
      const desde = periodo === 'antes' ? 1 : SEMANA_INTERVENCION;
      const hasta = periodo === 'antes' ? SEMANA_INTERVENCION - 1 : TOTAL_SEMANAS;

      for (let i = 0; i < cantidad; i += 1) {
        n += 1;
        const semana = desde + Math.floor(rand() * (hasta - desde + 1));
        const [minH, maxH] = def.retraso;
        // Después de la intervención los retrasos que quedan son más cortos.
        const factor = periodo === 'despues' ? 0.62 : 1;
        const retrasoHoras = roundTo((minH + rand() * (maxH - minH)) * factor, 1);
        const lineas = Math.max(1, Math.round(normal(rand, 14, 6)));
        const costo = roundTo(def.costoFijo + 38 + retrasoHoras * 1.9 + lineas * 1.4 + rand() * 24, 2);

        out.push({
          id: `INC-${String(n).padStart(3, '0')}`,
          semana,
          fecha: fechaDeSemana(semana, Math.floor(rand() * 5)),
          periodo,
          causa: def.causa,
          eme: def.eme,
          area: def.area,
          responsable: def.responsable,
          cliente: pick(rand, clientes),
          turno: pick(rand, turnos),
          retrasoHoras,
          costo,
          lineas,
          operario: `OP-${String(1 + Math.floor(rand() * 24)).padStart(2, '0')}`,
        });
      }
    }
  }

  return out.sort((a, b) => (a.semana - b.semana) || a.fecha.localeCompare(b.fecha));
}

export const incidencias: Incidencia[] = construir();

export const incidenciasAntes = incidencias.filter((i) => i.periodo === 'antes');
export const incidenciasDespues = incidencias.filter((i) => i.periodo === 'despues');

export function incidenciasPorPeriodo(periodo: 'todo' | 'antes' | 'despues'): Incidencia[] {
  if (periodo === 'todo') return incidencias;
  return incidencias.filter((i) => i.periodo === periodo);
}

export const columnasCsv: Array<{ key: keyof Incidencia; label: string }> = [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'semana', label: 'Semana' },
  { key: 'periodo', label: 'Periodo' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'causa', label: 'Causa' },
  { key: 'area', label: 'Area' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'turno', label: 'Turno' },
  { key: 'lineas', label: 'Lineas' },
  { key: 'retrasoHoras', label: 'Retraso (h)' },
  { key: 'costo', label: 'Costo no calidad (USD)' },
  { key: 'operario', label: 'Operario' },
];

export function incidenciasCsv(rows: Incidencia[] = incidencias): string {
  const head = columnasCsv.map((c) => c.label).join(',');
  const body = rows
    .map((row) => columnasCsv.map((c) => String(row[c.key])).join(','))
    .join('\n');
  return `${head}\n${body}`;
}
