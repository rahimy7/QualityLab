/**
 * Registro de incidencias de calidad de Pinturas del Sur.
 *
 * 146 lotes con desviación durante 24 semanas. Generados con semilla fija: el
 * dataset es idéntico para toda la clase.
 */
import { normal, pick, roundTo, seeded } from '../../../lib/random';
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
  /** Horas de retraso o retrabajo típicas de esta causa. */
  retraso: [number, number];
  /** Costo fijo de no calidad por evento, en USD. */
  costoFijo: number;
  detalle: string;
}

export const definicionCausas: DefinicionCausa[] = [
  {
    causa: 'Dispersión insuficiente',
    eme: 'maquina',
    area: 'Producción',
    responsable: 'Producción',
    antes: 42,
    despues: 11,
    retraso: [4, 18],
    costoFijo: 640,
    detalle:
      'El pigmento no alcanzó la finura requerida en el ensayo Hegman: el lote regresa al molino y se muele durante varias horas más.',
  },
  {
    causa: 'Viscosidad fuera de rango',
    eme: 'metodo',
    area: 'Producción',
    responsable: 'Producción',
    antes: 30,
    despues: 8,
    retraso: [2, 10],
    costoFijo: 380,
    detalle:
      'El ajuste final de viscosidad quedó por encima o por debajo de la especificación (KU 90–110). Se rediluye o se corrige con resina.',
  },
  {
    causa: 'Contaminación de línea',
    eme: 'medio',
    area: 'Producción',
    responsable: 'Producción',
    antes: 17,
    despues: 6,
    retraso: [3, 14],
    costoFijo: 1_180,
    detalle:
      'Restos del color anterior en el tanque o la tubería alteran el tono. Casi siempre se detecta en el ensayo espectrofotométrico y obliga a un lavado adicional.',
  },
  {
    causa: 'Materia prima fuera de spec',
    eme: 'material',
    area: 'Recepción',
    responsable: 'Compras',
    antes: 12,
    despues: 5,
    retraso: [6, 32],
    costoFijo: 820,
    detalle:
      'Resina, solvente o pigmento con humedad, número ácido o color base fuera de tolerancia. El lote no debió aceptarse en recepción.',
  },
  {
    causa: 'Falla de dosificación',
    eme: 'mano-obra',
    area: 'Producción',
    responsable: 'Producción',
    antes: 9,
    despues: 3,
    retraso: [1, 6],
    costoFijo: 520,
    detalle:
      'Error humano al pesar aditivos en cantidades pequeñas: 0.5 % adicional cambia el comportamiento del lote entero.',
  },
  {
    causa: 'Filtración deficiente',
    eme: 'medicion',
    area: 'Envasado',
    responsable: 'Producción',
    antes: 3,
    despues: 0,
    retraso: [2, 8],
    costoFijo: 260,
    detalle:
      'Malla saturada o cambiada tarde: el envase presenta partículas visibles y el lote se re-filtra antes de despachar.',
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
  retrasoHoras: number;
  costo: number;
  lineas: number;
  operario: string;
}

const clientes = [
  'Constructora Andes',
  'Automotores del Pacífico',
  'Metalúrgica Norte',
  'Muebles Industriales SR',
  'Astilleros Vega',
  'Estructuras Rojas',
  'Química Bolívar',
  'Talleres Central',
];

const turnos = ['Mañana', 'Tarde', 'Noche'] as const;

const INICIO = new Date(Date.UTC(2025, 0, 6));

function fechaDeSemana(semana: number, diaOffset: number): string {
  const d = new Date(INICIO);
  d.setUTCDate(d.getUTCDate() + (semana - 1) * 7 + diaOffset);
  return d.toISOString().slice(0, 10);
}

function construir(): Incidencia[] {
  const rand = seeded(20260916);
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
        const factor = periodo === 'despues' ? 0.58 : 1;
        const retrasoHoras = roundTo((minH + rand() * (maxH - minH)) * factor, 1);
        // "lineas" aquí representa kilogramos de producto afectado / 100 (para dar dimensión).
        const lineas = Math.max(1, Math.round(normal(rand, 16, 7)));
        const costo = roundTo(
          def.costoFijo + 45 + retrasoHoras * 4.2 + lineas * 2.6 + rand() * 60,
          2,
        );

        out.push({
          id: `LOT-${String(n).padStart(3, '0')}`,
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
          operario: `OP-${String(1 + Math.floor(rand() * 22)).padStart(2, '0')}`,
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
  { key: 'id', label: 'ID lote' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'semana', label: 'Semana' },
  { key: 'periodo', label: 'Periodo' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'causa', label: 'Causa' },
  { key: 'area', label: 'Area' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'turno', label: 'Turno' },
  { key: 'lineas', label: 'Kg × 100' },
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
